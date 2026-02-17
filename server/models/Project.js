import { Schema, model } from "mongoose";

const projectSchema = new Schema({
    name: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    owner: {type: Schema.Types.ObjectId, ref: "User", required: true},
    collaborators: [{type: Schema.Types.ObjectId, ref: "User"}],
    files: [{type: Schema.Types.ObjectId, ref: "Document"}]
});

export const Project = model("Project", projectSchema);
