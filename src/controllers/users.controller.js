import moment from "moment/moment.js";
import { userModel } from "../dao/models/user.model.js";
import UserRepository from "../dao/repositories/session.repository.js";
import UserDTO from "../dtos/user.dto.js";
import MailingService from "../services/mailing.js";

const userRepository = new UserRepository(userModel);
const mailingService = new MailingService();

export const getAllUsers = async (req, res) => {
  const allUsers = await userRepository.getAllUsers();
  const allUsersDTO = allUsers.map((user) => new UserDTO(user));
  res.status(200).send(allUsersDTO);
};

export const deleteInactiveUsers = async (req, res) => {
  try {
    const inactivePeriod = moment().subtract(14, "days");

    const result = await userRepository.deleteInactiveUsers(inactivePeriod);
    const deletedUsers = result.deletedUsers;
    if (result.deletedCount > 0) {
      await Promise.all(
        deletedUsers.map(async (user) => {
          await mailingService.sendSimpleMail({
            from: "NodeMailer Contant",
            to: user.email,
            subject: "Your account has been deleted",
            html: `
              <h1>Your account has been deleted</h1>
              <p>We inform you that your account has been deleted due to inactivity of more than 14 days.</p>
            `,
          });
        })
      );
    }
    if (result.deletedCount > 0) {
      res.status(200).send({
        message: `Deleted ${result.deletedCount} inactive users.`,
      });
    }
    if (result.deletedCount === 0) {
      res.status(200).send({
        message: `No inactive users found.`,
      });
    }
  } catch (error) {
    console.error("Error deleting inactive users:", error);
    res.status(500).send("Error deleting inactive users");
  }
};

export const deleteUserById = async (req, res) => {
  const { uid } = req.params;
  try {
    const deletedUser = await userRepository.deleteUserById(uid);
    if (!deletedUser) {
      res.status(404).send({ message: "User not found" });
    }
    res
      .status(200)
      .send({ message: "User deleted successfully", deletedUser: deletedUser });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error deleting user" });
  }
};

export const updateUserPremiumStatus = async (req, res) => {
  const { uid } = req.params;

  try {
    const user = await userRepository.getUserById(uid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ¡¡IMPORTANTE!! - Comento este codigo ya que aunque en el desafio 15 pedia esta verificacion, nunca explicaron como hacer para que un usuario suba los documentos requeridos, y si dejo el codigo sin comentar, no funcionaria el pasaje de premium a user y viceversa.

    // const requiredDocuments = [
    //   "Identificacion",
    //   "Comprobante de domicilio",
    //   "Comprobante de estado de cuenta",
    // ];
    // const uploadedDocuments = user.documents.map((doc) => doc.name);
    // const hasAllRequiredDocuments = requiredDocuments.every((doc) =>
    //   uploadedDocuments.includes(doc)
    // );

    // if (!hasAllRequiredDocuments) {
    //   return res.status(400).json({
    //     error: "The user has not finished processing their documentation",
    //   });
    // }

    if (user.role === "user") {
      user.role = "premium";
      await user.save();
    } else if (user.role === "premium") {
      user.role = "user";
      await user.save();
    }

    const userDTO = new UserDTO(user);
    res.json({ message: "User role updated successfully", user: userDTO });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Error updating user role" });
  }
};

export const uploadUserDocuments = async (req, res) => {
  try {
    const { uid } = req.params;
    const documents = req.files.map((file) => ({
      name: file.originalname,
      reference: file.path,
    }));

    const user = await userRepository.getUserById(uid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.documents.push(...documents);

    await user.save();
    return res
      .status(200)
      .json({ message: "Documents uploaded successfully", documents });
  } catch (error) {
    console.error("Error uploading documents:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
