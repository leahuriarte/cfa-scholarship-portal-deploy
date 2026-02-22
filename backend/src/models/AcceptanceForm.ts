import mongoose, { Schema, Document } from "mongoose";

export interface IAcceptanceForm extends Document {
  userId?: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  acceptedTerms: boolean;
  acceptedAt: Date;
  ipAddress: string;
  fullName?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  requestAmount?: string;
  cardLastFour?: string;
  formPurpose?: string;
  createdAt: Date;
}

const AcceptanceFormSchema = new Schema<IAcceptanceForm>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
      sparse: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: false,
    },
    acceptedTerms: {
      type: Boolean,
      required: true,
    },
    acceptedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    fullName: String,
    companyName: String,
    companyAddress: String,
    companyPhone: String,
    requestAmount: String,
    cardLastFour: String,
    formPurpose: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAcceptanceForm>(
  "AcceptanceForm",
  AcceptanceFormSchema
);
