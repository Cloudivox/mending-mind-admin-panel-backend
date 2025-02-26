import mongoose, { Document, Schema } from "mongoose";

export interface IOrganization extends Document {
    id: string;
    name: string;
    location: string;
    code: string;
    country: string;
    description: string;
    logo: string;
    status: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    therapists: string[];
}

const OrganizationSchema = new Schema<IOrganization>(
    {
        name: { type: String, required: true },
        location: { type: String, required: true },
        code: { type: String, required: true },
        country: { type: String, required: true },
        description: { type: String, required: true },
        logo: { type: String, required: true },
        status: { type: String, required: true },
        createdAt: { type: String, required: true },
        createdBy: { type: String, required: true },
        therapists: { type: [String], required: true, minlength: 2 },
        updatedAt: { type: String, required: false },
        updatedBy: { type: String, required: false },
    },
    {
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                ret.id = ret._id; // Assign _id to id
                delete ret._id; // Remove _id
                delete ret.__v; // Remove __v (versioning field)
            },
        },
        toObject: {
            virtuals: true,
            transform: (_doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

export default mongoose.model<IOrganization>("Organization", OrganizationSchema);
