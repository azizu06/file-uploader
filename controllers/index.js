import { body, validationResult, matchedData } from "express-validator";
import db from "../db/queries";
import bcrypt from "bcryptjs";
import passport from "../config/passport";
