import app from "./src/app.js";
import connectToDb from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

connectToDb()
    .then(() => {
        app.listen(PORT, () => console.log(`Server starts at PORT: ${PORT}`));
    })
    .catch((err) => {
        console.error('Failed to connect to the database:', err);
        process.exit(1);
    });