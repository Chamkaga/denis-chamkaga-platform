"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURE_FLAG_DEFINITIONS = exports.FeatureFlag = void 0;
var FeatureFlag;
(function (FeatureFlag) {
    FeatureFlag["AI"] = "ENABLE_AI";
    FeatureFlag["SUPPORT"] = "ENABLE_SUPPORT";
    FeatureFlag["LEDGER"] = "ENABLE_LEDGER";
    FeatureFlag["PUBLIC_ASSISTANT"] = "ENABLE_PUBLIC_ASSISTANT";
    FeatureFlag["VOICE_AI"] = "ENABLE_VOICE_AI";
})(FeatureFlag || (exports.FeatureFlag = FeatureFlag = {}));
exports.FEATURE_FLAG_DEFINITIONS = {
    [FeatureFlag.AI]: {
        key: FeatureFlag.AI,
        description: "Enables Admin AI Copilot dashboard controls",
        defaultValue: false,
        phase: "2B",
        owner: "AI Team"
    },
    [FeatureFlag.SUPPORT]: {
        key: FeatureFlag.SUPPORT,
        description: "Enables real-time support widget and audio calling integrations",
        defaultValue: false,
        phase: "2A",
        owner: "Support Team"
    },
    [FeatureFlag.LEDGER]: {
        key: FeatureFlag.LEDGER,
        description: "Enables central double-entry financial ledger auditing",
        defaultValue: false,
        phase: "2A",
        owner: "Finance Team"
    },
    [FeatureFlag.PUBLIC_ASSISTANT]: {
        key: FeatureFlag.PUBLIC_ASSISTANT,
        description: "Enables client-side voice chatbot integrations",
        defaultValue: false,
        phase: "3",
        owner: "AI Team"
    },
    [FeatureFlag.VOICE_AI]: {
        key: FeatureFlag.VOICE_AI,
        description: "Enables real-time voice synthesis and calling features",
        defaultValue: false,
        phase: "4",
        owner: "Voice Team"
    }
};
