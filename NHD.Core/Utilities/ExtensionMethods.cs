using System.ComponentModel;
using System.Globalization;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Web;
using System.Xml.Serialization;

namespace NHD.Core.Utilities
{
    /// <summary>
    /// This class is responsible of all extension methods for the application
    /// </summary>
    public static class ExtensionMethods
    {
        /// <summary>
        /// Tries to convert the specified string representation of a logical value to its
        /// System.Boolean equivalent. A return value indicates the boolean value of the string or false if the conversion failed.
        /// </summary>
        /// <returns>boolean value if self was converted successfully; otherwise, false</returns>
        public static bool ToBool(this string self)
        {
            bool.TryParse(self, out bool result);
            return result;
        }

        /// <summary>
        ///  Converts the string representation of a number in a specified style and culture-specific
        ///  format to its 32-bit signed integer equivalent. If conversion failed, returns 0 
        /// </summary>
        public static int ToInt(this string self)
        {
            int.TryParse(self, out int result);
            return result;
        }

        /// <summary>
        ///  Converts the string representation of a number in a specified style and culture-specific
        ///  format to its 32-bit signed integer equivalent. If conversion failed, returns 0 
        /// </summary>
        public static int ToInt(this char self)
        {
            int.TryParse(self.ToString(), out int result);
            return result;
        }

        /// <summary>
        ///  Converts the string representation of a number in a specified style and culture-specific
        ///  format to its 64-bit signed integer equivalent. If conversion failed, returns 0 
        /// </summary>
        public static long ToLong(this string self)
        {
            long.TryParse(self, out long result);
            return result;
        }

        /// <summary>
        ///  Converts the string representation of a number in a specified style and culture-specific
        ///  format to its nullable 32-bit signed integer equivalent. If conversion failed, returns null 
        /// </summary>
        public static int? ToNullableInt(this string self)
        {
            int.TryParse(self, out int result);
            return result == 0 ? null : (int?)result;
        }

        /// <summary>
        ///  Converts the string representation of a number in a specified style and culture-specific
        ///  format to its nullable 32-bit signed integer equivalent. If conversion failed, returns null 
        /// </summary>
        public static double? ToNullableDouble(this string self)
        {
            double.TryParse(self, out double result);
            return result == 0 ? null : (double?)result;
        }

        /// <summary>
        ///  Converts the string representation of a number to its System.Decimal equivalent.
        /// </summary>
        public static decimal ToDecimal(this string self)
        {
            decimal.TryParse(self, out decimal result);
            return result;
        }

        /// <summary>
        ///  Converts the string representation of a number to its System.Double equivalent.
        /// </summary>
        public static double ToDouble(this string self)
        {
            double.TryParse(self, out double result);
            return result;
        }

        /// <summary>
        /// it is an extension that get the distinct by field
        /// </summary>
        /// <typeparam name="TSource"></typeparam>
        /// <typeparam name="TKey"></typeparam>
        /// <param name="source"></param>
        /// <param name="keySelector"></param>
        /// <returns></returns>
        public static IEnumerable<TSource> DistinctBy<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, TKey> keySelector)
        {
            HashSet<TKey> seenKeys = new HashSet<TKey>();
            foreach (TSource element in source)
            {
                if (seenKeys.Add(keySelector(element)))
                {
                    yield return element;
                }
            }
        }
        public static decimal? ToNullableDecimal(this string self)
        {
            decimal.TryParse(self, out decimal result);
            return result == 0 ? null : (decimal?)result;
        }

        public static DateTime ToDateTime(this string self)
        {
            DateTime.TryParse(self, out DateTime result);
            return result;
        }

        public static DateTime ToDateTime(this string self, string format)
        {
            DateTime.TryParseExact(self, format, null, System.Globalization.DateTimeStyles.None, out DateTime result);
            return result;
        }

        public static string ToDateTimeString(this DateTime self, string format)
        {
            try { return self.ToString(format); }
            catch { return self.ToString(); }
        }

        public static string ToTimeString(this TimeSpan self, string format)
        {
            try { return self.ToString(format); }
            catch { return self.ToString(); }
        }

        public static DateTime? ToNullableDateTime(this string self, string format)
        {
            if (self.IsNullOrWhiteSpace()) return null;
            DateTime.TryParseExact(self, format, null, System.Globalization.DateTimeStyles.None, out DateTime result);
            if (result == DateTime.MinValue) return null;
            return result;
        }

        public static DateTime? ToNullableDateTime(this string self)
        {
            if (self.IsNullOrWhiteSpace()) return null;
            DateTime.TryParse(self, out DateTime result);
            if (result == DateTime.MinValue) return null;
            return result;
        }

        /// <summary>
        /// Returns the current quarter of a given date
        /// </summary>
        /// <param name="date"></param>
        /// <returns></returns>
        public static int GetQuarter(this DateTime date)
        {
            return (date.Month + 2) / 3;
        }

        /// <summary>
        /// Returns the date of the first day of the current quarter
        /// Example: quarter 2, year 2019 => 01-04-2019
        /// </summary>
        /// <param name="date"></param>
        /// <returns></returns>
        public static DateTime GetFirstDayOfCurrentQuarter(this DateTime date)
        {
            string year = date.Year.ToString();
            int quarter = date.GetQuarter();
            switch (quarter)
            {
                case 1: return (year + "-01-01").ToDateTime();
                case 2: return (year + "-04-01").ToDateTime();
                case 3: return (year + "-07-01").ToDateTime();
                default: return (year + "-10-01").ToDateTime();
            }
        }

        public static TimeSpan? ToNullableTimeSpan(this string self)
        {
            if (self.IsNullOrWhiteSpace()) return null;
            TimeSpan.TryParse(self, out TimeSpan result);
            if (result == TimeSpan.MinValue) return null;
            return result;
        }

        public static bool IsNullOrWhiteSpace(this string self)
        {
            return string.IsNullOrWhiteSpace(self);
        }

        /// <summary>
        /// Return the string value if not null and not whitespace, return null if null or whitespace
        /// </summary>
        /// <param name="self"></param>
        /// <returns></returns>
        public static string DefaultOrNull(this string self)
        {
            return string.IsNullOrWhiteSpace(self) ? null : self;
        }

        public static int AsInt(this object self)
        {
            try
            {
                return (int)self;
            }
            catch
            {
                return 0;
            }
        }

        public static T DeepCopy<T>(this T self)
        {
            using (var ms = new MemoryStream())
            {
                XmlSerializer s = new XmlSerializer(typeof(T));
                s.Serialize(ms, self);
                ms.Position = 0;
                return (T)s.Deserialize(ms);
            }
        }

        public static string ToAge(this DateTime self)
        {
            // 1.
            // Get time span elapsed since the date.
            TimeSpan s = DateTime.UtcNow.Subtract(self);

            // 2.
            // Get total number of days elapsed.
            int dayDiff = (int)s.TotalDays;

            // 3.
            // Get total number of seconds elapsed.
            int secDiff = (int)s.TotalSeconds;

            // 4.
            // Don't allow out of range values.
            if (dayDiff < 0 || dayDiff >= 31)
            {
                return null;
            }

            // 5.
            // Handle same-day times.
            if (dayDiff == 0)
            {
                // A.
                // Less than one minute ago.
                if (secDiff < 60)
                {
                    return "just now";
                }
                // B.
                // Less than 2 minutes ago.
                if (secDiff < 120)
                {
                    return "1 minute ago";
                }
                // C.
                // Less than one hour ago.
                if (secDiff < 3600)
                {
                    return string.Format("{0} minutes ago",
                        Math.Floor((double)secDiff / 60));
                }
                // D.
                // Less than 2 hours ago.
                if (secDiff < 7200)
                {
                    return "1 hour ago";
                }
                // E.
                // Less than one day ago.
                if (secDiff < 86400)
                {
                    return string.Format("{0} hours ago",
                        Math.Floor((double)secDiff / 3600));
                }
            }
            // 6.
            // Handle previous days.
            if (dayDiff == 1)
            {
                return "yesterday";
            }
            if (dayDiff < 7)
            {
                return string.Format("{0} days ago",
                dayDiff);
            }
            if (dayDiff < 31)
            {
                return string.Format("{0} weeks ago",
                Math.Ceiling((double)dayDiff / 7));
            }
            return null;
        }

        public static string SplitCamelCase(this string self)
        {
            return Regex.Replace(self, "(\\B[A-Z])", " $1");
        }

        public static string ToDescriptionString<T>(this T self) where T : struct, IConvertible
        {
            FieldInfo fi = self.GetType().GetField(self.ToString());

            DescriptionAttribute[] attributes = (DescriptionAttribute[])fi.GetCustomAttributes(
                typeof(DescriptionAttribute), false);

            if (attributes != null && attributes.Length > 0) return attributes[0].Description;
            else return self.ToString();
        }

        public static T ToEnum<T>(this string value)
        {
            try
            {
                return (T)Enum.Parse(typeof(T), value.Replace(" ", ""), true);
            }
            catch
            {
                return default;
            }
        }

        public static bool IsNullableType(this Type self)
        {
            return self.IsGenericType && Nullable.GetUnderlyingType(self) != null;
        }

        /// <summary>
        /// Add {key,value} to dictionary if key does not exist; if exist, update existing value
        /// </summary>
        public static void AddIfExist<TKey, TValue>(this Dictionary<TKey, TValue> self, TKey key, TValue value)
        {
            var existing = self.Any(a => Equals(a.Key, key));
            if (!existing) self.Add(key, value);
            else self[key] = value;
        }


        public static string ToTitleCase(this string self)
        {
            if (self.IsNullOrWhiteSpace()) return self;
            TextInfo textInfo = new CultureInfo("en-US", false).TextInfo;
            return textInfo.ToTitleCase(self);
        }
        public static bool IsNumeric(this string s)
        {
            float output;
            return float.TryParse(s, out output);
        }
        public static bool ContainsIgnoreCase(this string source, string toCheck)
        {
            if (source.IsNullOrWhiteSpace())
                return false;
            return source.IndexOf(toCheck, StringComparison.InvariantCultureIgnoreCase) >= 0;
        }

        /// <summary>
        ///  Decode Url
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static string UrlDecode(this string value)
        {
            return HttpUtility.UrlDecode(value);
        }
        public static string ToNullableString(this object self)
        {
            return self?.ToString();
        }
    }
}
