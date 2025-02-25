import dotenv from "dotenv";
import generate from "../src/gen";

dotenv.config({ path: ".env.local" });

await generate(process.env.FORCE == "1");
