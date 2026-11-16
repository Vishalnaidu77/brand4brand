import 'dotenv/config';
if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in the environment variables');
}
export const config = {
    MONGO_URI: process.env.MONGO_URI,
};
//# sourceMappingURL=config.js.map