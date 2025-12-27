using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.ContactMessages;
using NHD.Core.Repository.Lookup;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.ContactMessages;
using NHD.Core.Utilities;

namespace NHD.Core.Services.ContactMessages
{
    public class ContactMessagesService : IContactMessagesService
    {
        private readonly IContactMessagesRepository _contactMessagesRepository;
        private readonly ILookupRepository _lookupRepository;
        private readonly IEmailService _emailService;
        private readonly ILogger<ContactMessagesService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        protected internal AppDbContext _context;
        protected internal IDbContextTransaction Transaction;

        public ContactMessagesService(AppDbContext context, IContactMessagesRepository contactMessagesRepository, ILookupRepository lookupRepository, IEmailService emailService, ILogger<ContactMessagesService> logger, IHttpContextAccessor httpContextAccessor)
        {
            _contactMessagesRepository = contactMessagesRepository;
            _lookupRepository = lookupRepository;
            _emailService = emailService;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<PagedServiceResult<IEnumerable<ContactMessagesViewModel>>> GetContactMessagesAsync(int page = 1, int limit = 10)
        {
            try
            {
                if (page <= 0 || limit <= 0)
                {
                    return PagedServiceResult<IEnumerable<ContactMessagesViewModel>>.Failure("Page and limit must be greater than 0");
                }

                var pagedResult = await _contactMessagesRepository.GetContactMessagesAsync(page, limit);
                var contactMessagesDtos = pagedResult.Data.Select(MapToContactMessage).ToList();
                return PagedServiceResult<IEnumerable<ContactMessagesViewModel>>.Success(
                    contactMessagesDtos,
                    pagedResult.Total,
                    pagedResult.Page,
                    pagedResult.Limit
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contact messages");
                return PagedServiceResult<IEnumerable<ContactMessagesViewModel>>.Failure("An error occurred while retrieving contact messages");
            }
        }

        public async Task<ServiceResult<ContactMessagesViewModel>> GetViewModelContactByIdAsync(int id)
        {
            try
            {
                var section = await _contactMessagesRepository.GetContactMessageByIdAsync(id);
                if (section == null)
                {
                    return ServiceResult<ContactMessagesViewModel>.Failure($"Contact message with ID {id} not found.");
                }

                var sectionDto = MapToContactMessage(section);
                return ServiceResult<ContactMessagesViewModel>.Success(sectionDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving section with ID {id}");
                return ServiceResult<ContactMessagesViewModel>.Failure("An error occurred while retrieving the section");
            }
        }

        public async Task<ContactMessage> GetContactMessageByIdAsync(int id)
        {
            return await _contactMessagesRepository.GetByIdAsync(id);
        }

        public async Task<ServiceResult<ContactMessage>> SubmitContactAsync(ContactMessagesViewModel model)
        {
            await BeginTransactionAsync();

            try
            {
                if (model == null)
                    return ServiceResult<ContactMessage>.Failure("Invalid request payload.");

                var ipAddress = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();

                var contactMessage = new ContactMessage
                {
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    EmailAddress = model.Email,
                    SubjectLookupId = model.SubjectId,
                    Phone = model.Phone,
                    Message = model.Message,
                    IpAddress = ipAddress,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.ContactMessages.AddAsync(contactMessage);
                await SaveChangesAsync();

                var subjectLookup = await _lookupRepository.GetByIdAsync(contactMessage.SubjectLookupId);
                var subjectText = subjectLookup?.NameEn ?? string.Empty;
                var fullName = $"{contactMessage.FirstName} {contactMessage.LastName}".Trim();

                var contactEmailSent = await _emailService.SendContactUsEmailAsync(
                    contactMessage.EmailAddress,
                    fullName,
                    contactMessage.Phone,
                    subjectText,
                    contactMessage.Message
                );

                if (!contactEmailSent)
                {
                    await RollbackTransactionAsync();
                    return ServiceResult<ContactMessage>.Failure("Failed to send contact email.");
                }

                await _emailService.SendSuccessfullContactUsReplyEmailAsync(
                    contactMessage.EmailAddress,
                    fullName
                );

                await CommitTransactionAsync();

                return ServiceResult<ContactMessage>.Success(contactMessage);
            }
            catch (Exception ex)
            {
                await RollbackTransactionAsync();
                _logger.LogError(ex, "Error submitting contact message");
                return ServiceResult<ContactMessage>.Failure("An error occurred while submitting the contact message.");
            }
        }



        public async Task<ContactMessage> AddContactMessageAsync(ContactMessage contactMessage)
        {
            await _contactMessagesRepository.AddAsync(contactMessage);
            return contactMessage;
        }

        public async Task<ContactMessage> UpdateContactMessageAsync(ContactMessage contactMessage)
        {
            await _contactMessagesRepository.UpdateAsync(contactMessage);
            return contactMessage;
        }

        public async Task<ServiceResult<bool>> DeleteContactMessageAsync(int contactMessageId)
        {
            var contactMessage = await _contactMessagesRepository.GetByIdAsync(contactMessageId);
            if (contactMessage == null)
            {
                return ServiceResult<bool>.Failure($"Contact message with ID {contactMessageId} not found.");
            }

            try
            {
                await _contactMessagesRepository.DeleteAsync(contactMessageId);
                return ServiceResult<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting contact message with ID {contactMessageId}");
                return ServiceResult<bool>.Failure($"An error occurred while deleting the contact message: {ex.Message}");
            }
        }

        public async Task<ServiceResult<IEnumerable<LookupItemDto>>> GetContactMessageSubjectsAsync()
        {
            try
            {
                var types = await _lookupRepository.GetContactMessageSubjectsAsync();
                var typeDtos = types.Select(t => new LookupItemDto
                {
                    Id = t.LookupId,
                    NameEn = t.NameEn,
                    NameSv = t.NameSv
                });
                return ServiceResult<IEnumerable<LookupItemDto>>.Success(typeDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contact message subjects");
                return ServiceResult<IEnumerable<LookupItemDto>>.Failure("An error occurred while retrieving contact message subjects");
            }
        }

        #region Private Methods

        private ContactMessagesViewModel MapToContactMessage(ContactMessage contactMessage)
        {
            return new ContactMessagesViewModel
            {
                Id = contactMessage.ContactId,
                FirstName = contactMessage.FirstName,
                LastName = contactMessage.LastName,
                Email = contactMessage.EmailAddress,
                Phone = contactMessage.Phone,
                Subject = contactMessage.SubjectLookup.NameEn,
                SubjectId = contactMessage.SubjectLookupId,
                Message = contactMessage.Message,
                CreatedAt = contactMessage.CreatedAt
            };
        }
        #endregion Private Methods

        #region Transactions
        public async Task BeginTransactionAsync()
        {
            if (Transaction == null && !_context.InMemoryDatabase)
            {
                Transaction = await _context.Database.BeginTransactionAsync();
            }
        }

        public async Task CommitTransactionAsync()
        {
            if (Transaction != null)
            {
                await Transaction.CommitAsync();
            }

            Transaction?.Dispose();
            Transaction = null;
        }

        public async Task RollbackTransactionAsync()
        {
            if (Transaction != null)
            {
                await Transaction.RollbackAsync();
            }
        }

        public Task<int> SaveChangesAsync()
        {
            return _context.SaveChangesAsync();
        }

        #endregion Transactions
    }
}