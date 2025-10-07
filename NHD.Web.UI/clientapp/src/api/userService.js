import apiService from './base/apiService';

class userService extends apiService {
  constructor() {
    super('/users');
  }

  // Get all users
  async getUsers(page = 1, limit = 10) {
    return this.get('', { page, limit });
  }

  // Get user by ID
  async getUserById(id) {
    return this.get(id);
  }

  // Create new user
  async createUser(userData) {
    return this.post(userData);
  }

  // Update user
  async updateUser(id, userData) {
    return this.put(userData, id);
  }

  // Delete user
  async deleteUser(id) {
    return this.delete(id);
  }

  // Get user profile
  async getUserProfile() {
    return this.get('profile');
  }

  // Update user profile
  async updateUserProfile(profileData) {
    return this.patch(profileData, 'profile');
  }
}

export default new userService();