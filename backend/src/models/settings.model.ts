import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  value: string;
}

const SettingsSchema = new Schema<ISettings>({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true }
});

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);

export const DEFAULT_SETTINGS = [
  { key: 'enzona_consumer_key', value: '' },
  { key: 'enzona_consumer_secret', value: '' },
  { key: 'enzona_merchant_uuid', value: '' },
  { key: 'refund_percentage', value: '80' },
  { key: 'refund_enabled', value: 'true' }
];
