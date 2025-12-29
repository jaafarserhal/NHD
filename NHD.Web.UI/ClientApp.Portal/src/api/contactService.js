import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class contactService extends apiService {
    constructor() {
        super(apiUrls.contacts);
    }

    // Get all contact messages
    async getContactMessages(page = 1, limit = 10) {
        return this.get('', { page, limit });
    }

    // const exportToExcel = async () => {
    //     return this.get(apiUrls.exportContacts, {}, { responseType: 'blob' });
    // }

    exportToExcel = async () => {
        try {
            const response = await this.get(apiUrls.exportContacts, {
                responseType: 'blob'
            });

            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Contacts_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Error exporting contacts:', error);
            throw error;
        }
    };

}
export default new contactService();