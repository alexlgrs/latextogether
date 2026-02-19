import { User } from "../models/User.js";
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { env } from "node:process";

export const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "champs manquants" });
    } else {
        const user = await User.findOne({username: username});
        
        if(!user) return res.status(404).json({ message: "utilisateur introuvable" });

        else if (crypto.createHash('md5').update(password).digest("hex") != user?.password) {
            return res.status(401).json({ message: "mauvais identifiants" });
        }

        
        const token = jwt.sign(
            {userId: user._id, username: user.username}, 
            env.JWT_KEY, 
            {expiresIn: '1d'} 
        )

        return res.status(200).json({ message: "Login validé", user: user, token: token });
    }
}

export const register = async (req, res) => {

    const {username, password} = req.body;

    if(!username || !password) return res.status(400).json({message: "champs manquants"})
    if(await User.findOne({username: username})) return res.status(409).json({message: "utilisateur déjà existant"})
         
    else {
        const hashedPassword = crypto.createHash('md5').update(password).digest("hex");
        const newUser = new User({ username: username, password: hashedPassword});
        await newUser.save();

        const token = jwt.sign(
            {userId: newUser._id, username: newUser.username}, 
            env.JWT_KEY, 
            {expiresIn: '1d'} 
        )

        return res.status(201).json({ message: "Inscription validée", user: newUser, token:token});
    }
}