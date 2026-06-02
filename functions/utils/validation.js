const ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
    'video/mp4', 'video/quicktime', 'video/x-msvideo',
    'audio/mpeg', 'audio/mp4', 'audio/wav',
    'application/pdf', 'application/zip',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function sanitizeFileName(name) {
    if (!name) return 'untitled';
    const lastDot = name.lastIndexOf('.');
    let base, ext;
    if (lastDot > 0) {
        ext = name.substring(lastDot + 1);
        base = name.substring(0, lastDot);
    } else {
        base = name;
        ext = '';
    }
    const cleaned = base.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_').substring(0, 200);
    const safeExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return safeExt ? `${cleaned}.${safeExt}` : cleaned;
}

export function validateFileSize(size, maxBytes = MAX_FILE_SIZE) {
    return { valid: size <= maxBytes, maxBytes };
}

export function validateMimeType(mimeType) {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    const videoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    const audioTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav'];
    const docTypes = ['application/pdf', 'application/zip'];

    const category = imageTypes.includes(mimeType) ? 'image'
        : videoTypes.includes(mimeType) ? 'video'
        : audioTypes.includes(mimeType) ? 'audio'
        : docTypes.includes(mimeType) ? 'document'
        : 'unknown';

    return {
        valid: category !== 'unknown',
        category,
    };
}

export function validateIdentifier(value, label = 'identifier') {
    if (!value || typeof value !== 'string') {
        return { valid: false, message: `${label} is required` };
    }
    const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 64);
    if (cleaned !== value) {
        return { valid: false, message: `${label} contains invalid characters. Use only letters, numbers, hyphens, and underscores.` };
    }
    return { valid: true, value: cleaned };
}
