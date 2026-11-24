export interface PatientRegistrationInput {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  contact: string;
  address: string;
}

export type PatientRegistrationValidation =
  | { data: PatientRegistrationInput; error?: never }
  | { data?: never; error: string };

export function validatePatientRegistration(input: unknown): PatientRegistrationValidation {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { error: "Patient details are required." };
  }

  const body = input as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";

  if (name.length === 0 || name.length > 120) {
    return { error: "Name is required and must be 120 characters or fewer." };
  }
  if (typeof body.age !== "number" || !Number.isInteger(body.age) || body.age < 0 || body.age > 130) {
    return { error: "Age must be a whole number between 0 and 130." };
  }
  if (body.gender !== "Male" && body.gender !== "Female" && body.gender !== "Other") {
    return { error: "Select a valid gender." };
  }
  if (contact.length < 5 || contact.length > 40) {
    return { error: "Contact number is required and must be 40 characters or fewer." };
  }
  if (address.length === 0 || address.length > 300) {
    return { error: "Address is required and must be 300 characters or fewer." };
  }

  return {
    data: {
      name,
      age: body.age,
      gender: body.gender,
      contact,
      address,
    },
  };
}
