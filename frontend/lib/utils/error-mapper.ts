export function mapErrorCodeToMessage(code: string, rawMessage?: string): string {
  switch (code) {
    case "INSUFFICIENT_EVIDENCE":
      return "I couldn't find enough authoritative evidence in Indian Standards to answer that reliably.";
    case "DUPLICATE_DOCUMENT":
      return "This document already exists in the knowledge base.";
    case "PROVIDER_UNAVAILABLE":
    case "AI_SERVICE_UNAVAILABLE":
      return "The AI service is temporarily unavailable. Please try again.";
    case "INVALID_CREDENTIALS":
      return "Invalid email address or password.";
    case "UNAUTHORIZED":
      return "Your session has expired or you are not signed in.";
    case "FORBIDDEN":
      return "You do not have administrative permissions to perform this action.";
    case "NOT_FOUND":
      return rawMessage || "The requested resource could not be found.";
    case "VALIDATION_ERROR":
      return rawMessage || "Please verify your input fields and try again.";
    case "CONNECTION_ERROR":
      return "Unable to connect to the BIS Copilot service. Please ensure the backend is running.";
    default:
      return rawMessage || "An unexpected error occurred. Please try again.";
  }
}
