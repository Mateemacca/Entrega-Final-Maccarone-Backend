import { isValidPassword, createHash } from "../../utils/bcrypt.js";

export default class UserRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getAllUsers() {
    try {
      return await this.dao.find();
    } catch (error) {
      console.error("Error retrieving all users:", error);
    }
  }

  async getCurrentUser() {
    try {
      return await this.dao.findOne();
    } catch (error) {
      console.error("Error retrieving current user:", error);
      console.log("Error retrieving current user");
    }
  }

  async getUser(user) {
    try {
      const result = await this.dao.findOne({ email: user });
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getUserById(id) {
    try {
      const result = await this.dao.findOne({ _id: id });
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async deleteUserById(userId) {
    try {
      return await this.dao.findByIdAndDelete(userId);
    } catch (error) {
      console.error("Error deleting user by ID:", error);
    }
  }

  async deleteInactiveUsers(inactivePeriod) {
    try {
      const deletedUsers = await this.dao
        .find({
          last_connection: { $lt: inactivePeriod },
        })
        .exec();
      const result = await this.dao.deleteMany({
        last_connection: { $lt: inactivePeriod },
      });

      return {
        deletedCount: result.deletedCount,
        deletedUsers: deletedUsers,
      };
    } catch (error) {
      console.error("Error deleting inactive users in repository:", error);
      throw error;
    }
  }

  async registerUser(user) {
    try {
      return await this.dao.create(user);
    } catch (error) {
      console.error("Error registering user:", error);
      console.log("Error registering user");
    }
  }

  async loginUser(email, password) {
    try {
      const user = await this.dao.findOne({ email });
      if (!user || !isValidPassword(user, password)) {
        console.log("Invalid credentials");
      }
      return user;
    } catch (error) {
      console.error("Error logging in:", error);
      console.log("Error logging in");
    }
  }

  async logoutUser(req) {
    try {
      if (req.user) {
        req.user.last_connection = new Date();
        await req.user.save();
      }
      await req.session.destroy();
      return { message: "Successful logout" };
    } catch (error) {
      console.error("Error logging out:", error);
      console.log("Error logging out");
    }
  }

  async updateUser(id, user) {
    try {
      const result = await this.dao.findOneAndUpdate(
        { _id: id },
        { $set: user }
      );
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getUserToken(token) {
    try {
      const result = await this.dao.findOne({ "tokenPassword.token": token });
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
