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
const auth_1 = __importDefault(require("../middleware/auth"));
const event_1 = require("../controllers/event");
const router = express_1.default.Router();
router.post("/create-event/:organizationId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, event_1.createEvent)(req, res);
}));
router.get("/get-all-events/:organizationId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, event_1.getAllEvents)(req, res);
}));
router.post("/join-event/:eventId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, event_1.joinEvent)(req, res);
}));
exports.default = router;
