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
const organization_1 = require("../controllers/organization");
const router = express_1.default.Router();
router.post("/create-organization", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, organization_1.createOrganization)(req, res);
}));
router.post("/update-organization", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, organization_1.updateOrganization)(req, res);
}));
router.delete("/delete-organization", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, organization_1.deleteOrganization)(req, res);
}));
router.get("/get-all-organizations", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, organization_1.getAllOrganizations)(req, res);
}));
router.post("/verify-code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, organization_1.verifyCode)(req, res);
}));
router.get("/:code", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, organization_1.getDetailsByCode)(req, res);
}));
router.delete("/delete-therapist-organization/:organizationId/:therapistId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, organization_1.deleteTherapistFromOrganization)(req, res);
}));
router.post("/add-therapist/:organizationId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, organization_1.addTherapistInOrganization)(req, res);
}));
exports.default = router;
