import { userRepository } from '../repositories/user.repository';
import { NotFoundError } from '../utils/error';

export class UserService {
    /**
     * Get all users
     */
    async getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get user by ID
     */
    async getUserById(id: number) {
        const user = await userRepository.findByIdWithRelations(id);

        if (!user) {
            throw new NotFoundError(`User dengan ID ${id} tidak ditemukan`);
        }

        return user;
    }
}

export const userService = new UserService();
