import { test, expect, request } from "@playwright/test";
import serviceOffering from "./service-offering.json";
import providerNotification from "./provider-post-notification.json";
import consumerNotification from "./consumer-post-notification.json";

let providerAuthToken;
let consumerAuthToken;
test.describe("Data Contract Non Negotiable Flow", () => {
  test("Service Health", async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/dct/api/health`);

    // Validate status code
    expect(response.status()).toBe(200);

    // Parse the response JSON
    const healthResponse = await response.json();

    // Validate if the response contains Data Contract Signature
    expect(healthResponse).toHaveProperty("status", "ok");
  });
  
  // Before registerin the service offering in the data contract service
  // it is mandatory to register the offering in the federated catalog
  let registerAssetResponse;
  test("Register a data asset", async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}/dct/api/register`, {
      headers: {
        "Content-Type": " application/ld+json",
      },
      data: serviceOffering,
    });

    // Validate status code
    expect(response.status()).toBe(201);

    // Parse the response JSON
    registerAssetResponse = await response.json();

    // Validate if the response contains Data Contract Signature
    expect(registerAssetResponse).toHaveProperty("proof");
  });

  let finalContract;
  test("Make contract", async ({ request, baseURL }) => {
    const consumerSignature = {
      created: "2022-08-18T10:41:35Z",
      jws: "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..Z3TevpLn-1MEc4hIdvmocc4uSWL-Y0xNoXuc8Pqp2H3u2N8SRC1QDr7oKE1lCiILf5B_npG61H4zWmuVcX0GBw",
      proofPurpose: "assertionMethod",
      type: "Ed25519Signature2018",
      verificationMethod: "did:consumer:key:123",
    };
    const consumerDid = "did:consumer";
    const consumerIssuer = "did:consumer:controller";

    // Clone registerAssetResponse to avoid modifying the original data
    const makeContractBody = {
      ...registerAssetResponse,
      verifiableCredential: [...registerAssetResponse.verifiableCredential],
      proof: undefined,
    };

    makeContractBody.verifiableCredential[0].issuer = consumerIssuer;
    makeContractBody.verifiableCredential[0].credentialSubject["gax:consumer"] = consumerDid;
    // The consumer sign and add the signature to the proof array
    makeContractBody.verifiableCredential[0].proof.push(consumerSignature);

    const response = await request.post(`${baseURL}/dct/api/make/contract`, {
      headers: {
        "Content-Type": " application/ld+json",
      },
      data: makeContractBody,
    });

    // Validate status code
    expect(response.status()).toBe(201);

    // Parse the response JSON
    finalContract = await response.json();

    // Validate if the response contains Data Contract final Signature
    expect(finalContract).toHaveProperty("proof");
  });

  test("log contract token for provider", async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}/dct/api/log/token`, {
      headers: {
        "Content-Type": " application/ld+json",
      },
      data: finalContract,
    });

    // Validate status code
    expect(response.status()).toBe(201);

    providerAuthToken = await response.text();
    // The DCT currently return a fake token
    // but the DEL accept only the following token
    providerAuthToken = process.env.PROVIDER_AUTH_TOKEN ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXgtZGNzOmxvZ0lEIjoiMjExNjUzNDktZTBiNy00NjYxLWFmYWYtNGE5ZWJmZGMwZGViIiwiZ2F4LWRjczpkYXRhVHJhbnNhY3Rpb25JRCI6IjEyMyIsImdheC1kY3M6Y29udHJhY3RJRCI6Imh0dHA6Ly9leGFtcGxlLm9yZy9kYXRhLWFzc2V0LTEiLCJpc3MiOiIoTG9nZ2luZyBzZXJ2aWNlIElEKSIsInN1YiI6ImRpZDpwcm92aWRlcjoxMjMiLCJhdWQiOiIoR1gtREVMUyBpZGVudGlmaWVyKSIsImV4cCI6MTY2MTI1NjQxMiwiaWF0IjoxNjYwODI0NDEyfQ.tWFCqb4daL7CQ7FC-c-dbIs5YDjRqzID-vMdkvuOP4E";
  });

  test("log contract token for consumer", async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}/dct/api/log/token`, {
      headers: {
        "Content-Type": " application/ld+json",
      },
      data: finalContract,
    });

    // Validate status code
    expect(response.status()).toBe(201);

    consumerAuthToken = await response.text();
    // The DCT currently return a fake token
    // but the DEL accept only the following token
    consumerAuthToken = process.env.CONSUMER_AUTH_TOKEN ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXgtZGNzOmxvZ0lEIjoiMjExNjUzNDktZTBiNy00NjYxLWFmYWYtNGE5ZWJmZGMwZGViIiwiZ2F4LWRjczpkYXRhVHJhbnNhY3Rpb25JRCI6IjEyMyIsImdheC1kY3M6Y29udHJhY3RJRCI6Imh0dHA6Ly9leGFtcGxlLm9yZy9kYXRhLWFzc2V0LTEiLCJpc3MiOiIoTG9nZ2luZyBzZXJ2aWNlIElEKSIsInN1YiI6ImRpZDpjb25zdW1lcjoxMjMiLCJhdWQiOiIoR1gtREVMUyBpZGVudGlmaWVyKSIsImV4cCI6MTY2MTI1NjQxMiwiaWF0IjoxNjYwODI0NDEyfQ.rUQtzr06Jd07qYzI-yTVn-YyG35_vMRu9spXtvljxEA";
  });
});

let adminToken;
test.describe("Data Exchange Logging", () => {
  test("Provider: Send notification", async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}/del/api/inbox`, {
      headers: {
        "Content-Type": "application/ld+json",
        Authorization: `Bearer ${providerAuthToken}`,
      },
      data: providerNotification,
    });

    // Validate status code
    expect(response.status()).toBe(202);
  });

  test("Consumer: Send notification", async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}/del/api/inbox`, {
      headers: {
        "Content-Type": "application/ld+json",
        Authorization: `Bearer ${consumerAuthToken}`,
      },
      data: consumerNotification,
    });

    // Validate status code
    expect(response.status()).toBe(202);
  });

  test("Get Notifications", async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/del/api/inbox`, {
      headers: {
        "Content-Type": "application/ld+json",
        Authorization: `Bearer ${providerAuthToken}`,
      },
    });

    // Validate status code
    expect(response.status()).toBe(200);

    // Validate response body if it is an array
    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
  });

  test("Login to the admin portal", async ({ request, baseURL }) => {
    const loginBody = {
      username: "admin",
      password: "xfsc4Ntt!",
    };
    const response = await request.post(`${baseURL}/del/api/auth/login`, {
      data: loginBody,
    });

    // Validate status code
    expect(response.status()).toBe(201);

    // Parse the response JSON to get the Token
    adminToken = (await response.json()).accessToken;
  });

  test("Get list of logs", async ({ request, baseURL }) => {
    const response = await request.get(
      `${baseURL}/del/api/logs?page=1&pageSize=5`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    // Validate status code
    expect(response.status()).toBe(200);
  });

  test("Get list of settings", async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/del/api/settings`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    // Validate status code
    expect(response.status()).toBe(200);
  });

  test("update settings", async ({ request, baseURL }) => {
    const updatedSettings = {
      SETTING_LOG_PRUNING_CRON: "*/4 * * * *",
    };
    const response = await request.put(`${baseURL}/del/api/settings`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      data: updatedSettings,
    });

    // Validate status code
    expect(response.status()).toBe(200);
  });
});
