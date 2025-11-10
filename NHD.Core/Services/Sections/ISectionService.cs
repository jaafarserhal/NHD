using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.Sections;

namespace NHD.Core.Services.Sections
{
    public interface ISectionService
    {
        Task<PagedServiceResult<IEnumerable<SectionViewModel>>> GetSectionsAsync(int page = 1, int limit = 10);
        Task<ServiceResult<SectionViewModel>> GetViewModelSectionByIdAsync(int id);
        Task<Section> GetSectionByIdAsync(int id);
        Task<Section> AddSectionAsync(Section section);
        Task<Section> UpdateSectionAsync(Section section);
        Task<ServiceResult<bool>> DeleteSectionAsync(int sectionId);

        Task<ServiceResult<IEnumerable<SectionViewModel>>> GetSectionByTypeAsync(int typeId, int top);
        Task<ServiceResult<IEnumerable<LookupItemDto>>> GetTypesAsync();


    }
}