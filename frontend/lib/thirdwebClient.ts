import { createThirdwebClient } from "thirdweb";

// Create the thirdweb client
// Get your client ID from https://thirdweb.com/dashboard
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});
