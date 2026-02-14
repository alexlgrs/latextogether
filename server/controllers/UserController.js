import { Request, Response } from "express";
import { User } from "../models/User";

export const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

export const createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
};