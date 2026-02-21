


namespace NHD.Core.Utilities
{

    public enum RoleType
    {
        Undefined = 0,
        Admin = 1,
        StoreOwner = 2,
        Customer = 3

    }


    public enum LookupType
    {
        Undefined = 0,
        ProductCategory = 100,
        ProductType = 200,
        ProductSize = 300,
        BoxCategory = 400,
        SectionType = 500,
        CustomerStatus = 600,
        ContactMessageSubject = 800,
        FaqType = 900
    }

    public enum FaqTypeLookup
    {
        ShippingAndDelivery = 900,
        PaymentAndRefunds = 901,
        Security = 902,
    }
    public enum CustomerStatusLookup
    {
        Pending = 600,
        Active = 601,
        InActive = 602,
        Guest = 603,
    }

    public enum ProductSizeLookup
    {
        Piece_1 = 300,
        Pieces_3 = 301,
        Pieces_8 = 302,
        Pieces_9 = 303,
        Pieces_12 = 304,
        Pieces_20 = 305,
        Pieces_35 = 306,
        Grams_250 = 307,
        Grams_400 = 308,
        Grams_450 = 309,
        Grams_500 = 310,
        Milliliters_400 = 311
    }

    public enum OrderStatusLookup
    {
        Pending = 400,
        Paid = 401,
        Shipped = 402,
        Canceled = 403,
        PaymentFailed = 404,
    }

    public enum BoxCategoryLookup
    {
        SignatureDateGifts = 100,
        SignatureDates = 101,
        ChocolateDates = 102,
        ClassicDatePouches = 103,
        DateSnacks = 104,
        DateSweetners = 105
    }

    public enum BoxTypeEnum
    {
        PlainDate = 200,
        AssortedDate = 201,
        FilledDate = 202,
        None = 203
    }

    public enum HttpStatusCodeEnum
    {
        OK = 200,
        BadRequest = 400,
        Unauthorized = 401,
        Forbidden = 403,
        NotFound = 404,
        Conflict = 409,
        InternalServerError = 500,
        // Add more as needed
    }

    public enum UserStatusLookup
    {
        Undefined = 0,
        Active = 100,
        Blocked = 101,
        ChangePasswordRequired = 102,
        Deleted = 103
    }

    public enum UserCodeStatusLookup
    {
        Pending = 200,
        Processed = 201,
        Canceled = 202

    }

    public enum SectionType
    {
        HomeCarousel = 500,
        HomeCallToAction = 501,
        HomeGifts = 502,
        HomeOurProducts = 503,

        HomeCustomeGifts = 504,
        HomeSubscribe = 505,
        HomeFillDates = 506,
        AboutMainSection = 507,
        AboutWeLoveDates = 508,
        AboutNawaExperience = 509,
        ShopMainSection = 510,
        OurDatesMainSection = 511,
    }

    public enum AddressType
    {
        Billing = 700,
        Shipping = 701,
        Both = 702
    }

    public enum SubjectType
    {
        OnlineShopping = 800,
        CorporateGifts = 801,
        SalesInquiry = 802,
    }

    public enum SystemParameterLookup
    {
        Undefined = 0,
        ShippingCost = 100,
        ShippingArrivalTime = 200,
    }


}
