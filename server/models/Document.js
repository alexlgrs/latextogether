import { Schema, model } from "mongoose";

const documentSchema = new Schema({
    name: {type: String, required: true},
    content: {type: String, default: "\\documentclass{article}\n\\begin{document}\n\\end{document}"},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

export const Document = model("Document", documentSchema);