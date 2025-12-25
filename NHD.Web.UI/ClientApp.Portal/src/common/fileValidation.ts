// utils/fileValidation.ts

export interface FileValidationResult {
    isValid: boolean;
    error?: string;
}

export interface FileValidationOptions {
    maxSizeInMB?: number;
    allowedTypes?: string[];
}

/**
 * Validates file size against a maximum limit
 * @param file - The file to validate
 * @param maxSizeInMB - Maximum file size in megabytes (default: 1MB)
 * @returns Validation result with isValid flag and optional error message
 */
export const validateFileSize = (
    file: File,
    maxSizeInMB: number = 1
): FileValidationResult => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    const fileSizeInMB = file.size / 1024 / 1024;

    if (file.size > maxSizeInBytes) {
        return {
            isValid: false,
            error: `Image size must be less than ${maxSizeInMB}MB. Selected file is ${fileSizeInMB.toFixed(2)}MB.`
        };
    }

    return { isValid: true };
};

/**
 * Validates file type against allowed MIME types
 * @param file - The file to validate
 * @param allowedTypes - Array of allowed MIME types (e.g., ['image/jpeg', 'image/png'])
 * @returns Validation result with isValid flag and optional error message
 */
export const validateFileType = (
    file: File,
    allowedTypes: string[]
): FileValidationResult => {
    if (!allowedTypes.includes(file.type)) {
        const allowedExtensions = allowedTypes
            .map(type => type.split('/')[1])
            .join(', ');

        return {
            isValid: false,
            error: `Invalid file type. Allowed types: ${allowedExtensions}`
        };
    }

    return { isValid: true };
};

/**
 * Validates file against multiple criteria
 * @param file - The file to validate
 * @param options - Validation options (maxSizeInMB, allowedTypes)
 * @returns Validation result with isValid flag and optional error message
 */
export const validateFile = (
    file: File,
    options: FileValidationOptions = {}
): FileValidationResult => {
    const { maxSizeInMB = 1, allowedTypes } = options;

    // Validate file size
    const sizeValidation = validateFileSize(file, maxSizeInMB);
    if (!sizeValidation.isValid) {
        return sizeValidation;
    }

    // Validate file type if specified
    if (allowedTypes && allowedTypes.length > 0) {
        const typeValidation = validateFileType(file, allowedTypes);
        if (!typeValidation.isValid) {
            return typeValidation;
        }
    }

    return { isValid: true };
};