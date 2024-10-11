# DataExchange

## Introduction
DataExchange is a project designed to facilitate the exchange of data between different systems and services. The primary objective is to provide a robust and scalable solution for data transfer, ensuring data integrity and security throughout the process.
## Definitions and Vocabulary

| **Term**              | **Description**                                                                                                                                                                                                 |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Data**              | Any digital representation of acts, facts or information and any compilation of such acts, facts or information.                                                                                                |
| **Data Product**       | A collection of one or more data that are packaged by the Data Provider and made ready for Data Exchange.                                                                                                        |
| **Data Provider**      | A participant that acquires the right to access and use some data and that makes Data Products available.                                                                                                       |
| **Data Catalog**       | A Data Catalogue presents a set of available Data and Data Products that can be queried.                                                                                                                        |
| **Data Consumer**      | A participant that receives data in the form of a Data Product. The data is used for query, analysis, reporting or any other data processing.                                                                    |
| **Data Exchange Services** | A set of services that provides features enabling a Data Exchange, such as and not limited to: policy negotiation for access control and usage control, exchange traceability, service protocol negotiation, data access, data tiering, access enforcement, usage enforcement. <br> **Note**: Data Connector or Data Exchange Platform are two different architecture implementations of potentially similar Data Exchange service features. |


## Product Perspective
GX-DCS is a stateless microservice providing backend logic with a few interfaces and a minimal GUI, without any database, except for local caching. It relies on several Gaia-X Federation Services (GXFS) to support a data ecosystem:

- **Gaia-X Federated Catalogue (GX-FC)**: This is where Data Providers publish Data Asset Self-Descriptions (SDs). GX-FC expects Data Providers to operate an endpoint for subscribing to these SDs.
- **Gaia-X Portal**: This frontend allows browsing, searching, and comparing Gaia-X assets. It mainly functions as a GUI for GX-FC, gathering all its information from there.
- **Gaia-X Trust Service**: Provides functionality for validating signatures, resolving DIDs, and retrieving public keys of Participants. It's essential for verifying identities within Gaia-X.
- **Gaia-X Data Exchange Logging Service (GX-DELS)**: Complements GX-DCS by handling data transaction logs for billing, monitoring, and auditing. GX-DELS requires valid Log Tokens, which are issued by GX-DCS.

![Product Overview](docs/productOverview.png)

## Product Functions

| **Endpoint**              | **Description**                                                                                                                                                                                                 |
|-----------------------|-----------------------------------------|
| **/register**              | Data Asset Registration|
| **/make/contract**       | Making a Contract|
| **/negotiate**      | Contract Negotiation|
| **/finalize**       | Finalization of a Contract|
| **/validate**      | Contract Validation                                               |
| **/log/token** | Get Log Token|


 ### /register
API for Data Asset Registration Register contract API

**<ins>Data Asset Registration API:</ins>** Every Data Provider must register a Data Asset through an API ("/register").

**<ins>Self-Description Specification:</ins>** All elements of the Data Asset Self-Description must be definable during the registration process

**<ins>Negotiable Properties:</ins>** If placeholders are used, these must be marked as negotiable by setting the gax:negotiable property to true in any Rule containing a placeholder.

**<ins>Steps:</ins>**
   - Verify that users are GX Participants before allowing them to register a Data Asset.
   - Check the properties named "gax:negotiable" to true in each Rule that contains a placeholder.
   - Check with the GX-FC if the Self-Description is formally correct.
   - If the validation of the Data Asset Self-Description and the providers signature were correct, the GX-DCS MUST add its signature to the Data Asset Self-Description using a hash that includes the signature of the Data Provider and send the resulting signed SD back to the Data Provider (for both interfaces).

**<ins>Missing implementation:</ins>**

The Check with the GX-FC if the Self-Description is formally correct.


### /make/contract
API for validating the format and content of the DASD and sign it by the DSC.

**<ins>Steps:</ins>**
   - GX-DCS confirms the Consumer s identity and the provided details and finalizes the Data Contract by replacing the previous GX-DCS Signature with a new version now calculated over all details in the finale contract.
   - Validate the provider signature
   - Verify that the consumer is GX participants
   - Validate the consumer signature
   - Check with the GX-FC if the Self-Description is formally correct.
   - Check if the DASD is non-negotiable
   - Check if there is no confirmation requirement
   - Check if there is no confirmation requirement

**<ins>Missing implementation:</ins>**

1. Transfer Contract: 
This could be used to automatically evaluate Agreements or to establish manual Confirmation flows on the Provider side.
    - The Providers need to offer an endpoint (that the GX-DCS can transfer contract offers to) utilizing the property "gax:hasLegallyBindingAddress" in their Self Descriptions.
    - MUST forward the Agreement to the Data Provider and MUST inform the Data Consumer about it.
2. The Check with the GX-FC if the Self-Description is formally correct.


### /log/token

The GX-DCS offers an endpoint for getting a Log Token. It returns a Log Token if the submitted finalized Agreement is valid.
- The prerequisite for that is a valid finalized Agreement which contains optional or mandatory logging.
- The GX-DCS evaluates the finalized Agreement and returns whether a finalized Agreement is valid or not, including a humanreadable explanation by validating the signature of the **provider**, **consumer** and the **DCT**.
- Returns a Log Token which authenticates access at GX-DELS


### /negotiate
**<ins>API for Negotiating Agreements:</ins>** The Data Contract negotiation process is done through the endpoint: "/negotiate".

**<ins>Triggering Negotiation:</ins>** It must be possible to initiate the Agreement negotiation via the API. The Data Consumer must send the Agreement to trigger this request.

**<ins>Interacting Parties:</ins>** The GX-DCS must interact with the Provider’s endpoint for confirmation, the Data Consumer (requester), and the Federated Catalogue during the negotiation process.

**<ins>Consumer Signature Requirement:</ins>** Consumer Signature Requirement: The Data Consumer must sign the completed Data Asset Self-Description (with Consumer details and placeholders filled) before submitting the request.

**<ins>Forwarding the Agreement:</ins>** If the Agreement passes all checks, the GX-DCS must forward it to the Data Provider.

**<ins>Provider’s Decision:</ins>** The Data Provider decides whether to accept or decline the Agreement. If accepted, the Provider proceeds to the /finalize endpoint. If declined, the Data Provider must inform the Data Consumer.

| **Input** |**Ouptut**                                                                                                                                                                                            |
|--------------------------------------|-----------------------------------------|
| Agreement signed by the Data Consumer| Confirmation that the Agreement was forwarded to the Data Provider.|


 **Steps**:

The Data Provider invites Data Consumers to make contract offers by sharing the Data Asset Self-Description (DASD) (The contract cannot be finalized until the Data Provider actively confirms the offer)

1- Consumers, in this case, submit offers by adding their Consumer Details and signing the DASD (Can also propose modifications to negotiable parts of the contract, if allowed.)

2- GX-DCS verify that users are GX participants, validate the format and signature

3- GX-DCS send the data assest after adding his signature 


### /finalize

**<ins>API for Finalizing Agreements:</ins>** The Agreement finalization process is done through the endpoint: "/finalize". This step is required for Agreements negotiated via the "/negotiate" endpoint.

**<ins>Request from Data Provider:</ins>** The Data Provider must send a request to the /finalize endpoint, containing the Agreement signed by both the Data Provider and the Data Consumer.
    
**<ins>Signature Validation:</ins>** The GX-DCS must validate the signatures of both the Data Provider and the Data Consumer before proceeding with finalization.

**<ins>Finalizing the Agreement:</ins>** Once both signatures are validated, the GX-DCS must sign the Agreement, including the signatures of the Data Provider and Data Consumer in the hash.
    
**<ins>Distribution of Finalized Agreement:</ins>** After signing, the GX-DCS must send the finalized Agreement to both the Data Provider and the Data Consumer.

| **Input** |**Ouptut**                                                                                                                                                                                            |
|--------------------------------------|-----------------------------------------|
|Agreement (Signed by Data Provider and Data Consumer) | Finalized Agreement (Signed by Data Provider, Data Consumer and GX-DCS)|


 **Steps**:

1- If the Data Provider accepts the offer, they sign the contract using the /finalize endpoint, including their signature over all relevant details 

2- GX-DCS verify that users are GX participants, validate the format and both signature

3- GX-DCS adding his signature over all content and inform consumer

### /validate

**<ins>API for Validating Agreements:</ins>** The validation of finalized Agreements is handled via the endpoint: "/validate".

**<ins>Differentiation Between Agreement Types:</ins>**
    1. A negotiable Agreement has one or more gax:negotiable properties or the gax:confirmationRequired property set to true.
    2. A non-negotiable Agreement has all gax:negotiable properties set to false.
    
**<ins>Signature Verification:</ins>** The GX-DCS must verify the signatures of the finalized Agreement:
    1. GX-DCS signature
    2. Consumer signature
    3. Provider signature

**<ins>Provider Signature in Non-Negotiable Agreements:</ins>** For non-negotiable Agreements, the validation of the Provider’s signature must be done by removing the Consumer’s information before validation.

**<ins>Validation Responsibility:</ins>** The GX-DCS is responsible for validating the finalized Agreement.

| **Input** |**Ouptut**                                                                                                                                                                          |
|--------------------|-------------------------------------|
|Finalized Agreement | Validity of the finalized Agreement |