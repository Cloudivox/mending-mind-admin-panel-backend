"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, user_1.signin)(req, res);
}));
router.post("/create/:organizationId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, user_1.createUser)(req, res);
}));
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, user_1.signup)(req, res);
}));
router.get("/get-user-details", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, user_1.getUserDetails)(req, res);
}));
router.get("/get-all-users/:organizationId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, user_1.getAllUsers)(req, res);
}));
router.put("/update-user", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, user_1.updateUser)(req, res);
}));
router.delete("/delete-user", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, user_1.deleteUser)(req, res);
}));
router.get("/get-all-therapists", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, user_1.getAllTherapist)(req, res);
}));
router.post("/client-register/:organizationId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, user_1.clientRegistration)(req, res);
}));
exports.default = router;
