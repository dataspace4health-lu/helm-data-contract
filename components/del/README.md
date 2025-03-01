# Data Exchange Logging

## Introduction
The Gaia-X Data Exchange Logging Service (GX-DELS) will improve data traceability and contract negotiation by creating a logging service that can be used by the GX-DCS to guarantee lossless and auditable logging.
Every data transaction within Gaia-X consists of the following parts:

After a contract has been agreed upon and has been signed by both parties, data transmission from the Data Provider to the Data Consumer can commence. The contract negotiation can lead to both sides agreeing on a logging service (this document) which is then used by both sides to log data transactions. The GX-DELS provides features to enable integrity and access protected logging in a decentralized manner for both parties.

## Product Perspective
GX-DELS is a stateless microservice. It Complements GX-DCS by handling data transaction logs for billing, monitoring, and auditing. GX-DELS requires valid Log Tokens, which are issued by GX-DCS.

![Product Overview](docs/del-data-exchange-notification.png)

## Product Functions

Below is a sequence diagram that illustrates the detailed interaction between the Data Provider, Data Consumer, GX-DELS (Gaia-X Data Exchange Logging Service), and the notification system throughout the data exchange process. This process ensures that data transactions are properly logged and tracked, allowing both parties and external consumers to verify the status of the transfer.

Steps of the Process:

1. Data Provider Sends Notification (POST to Inbox) </br>
Before sending the actual data, the Data Provider first sends a notification to the GX-DELS Inbox, alerting the system about the upcoming data exchange. </br>
The notification includes the contract identifier, which links the data transaction to a specific contract or agreement. </br>
This notification is logged and assigned a unique contract identifier to link it to the specific transaction.

2. Data Provider Sends the Data (GET Contract DCT) </br>
Following the notification, the Data Provider sends the actual data to the Data Consumer. </br>
The Contract (DCT) in the diagram is referenced during this exchange to ensure that the data transfer complies with the agreed terms. </br>
The Data Consumer checks the contract details using GET/HEAD requests.

3. Data Consumer Receives the Data (Post to Inbox) </br>
After successfully receiving the data, the Data Consumer sends a notification back to the GX-DELS Inbox to confirm the reception of the data. </br>
This update is logged by GX-DELS, linking it to the earlier notification sent by the Data Provider.

4. GX-DELS Provides Query Access (GET Notifications) </br>
Both the Data Provider and Data Consumer, as well as third-party consumers, can query the notification logs in GX-DELS. </br>
The GET/HEAD requests allow the involved parties to track the notifications and confirm the status of the data transfer.

Key Components:

- Inbox: This is where all notifications related to the data transaction are logged by GX-DELS.
- DCT: The contract or agreement tied to the data transfer. Both the Data Provider and Data Consumer can reference this contract using GET/HEAD requests to ensure the transaction is compliant with the terms.</br>
![Product Overview](docs/Sequence%20Diagram%20Detailed%20Interaction.png)


### How Data Sending Works:
1. **Does the Provider Push the Data?**
    - One possibility is that the provider actively sends (or "pushes") the data to the consumer.
2. **Does the Consumer Pull the Data?** (Most likely correct)
    - A more likely scenario is that the consumer pulls the data from the provider when it is ready.
3. **Could Both Methods Be Possible?**
    - It's also possible that both pushing and pulling methods are used, depending on the use case.

#### **If the Consumer Pulls the Data (Most Likely Scenario):**
The main question here is: **How does the consumer know when the data is ready to pull?**
The answer lies in a notification system.
- Notification System:
    - The provider sends a notification when the data is ready.
    - The consumer listens for this notification, and as soon as it receives the notification, it pulls the data from the provider.

Example Workflow (Pull with Notification):
1. Consumer Pulls Data:
    - The consumer periodically checks or waits for a notification from the provider.
2. Provider Sends Notification:
    - When the provider is ready with the data, it sends a notification to the consumer.
3. Consumer Receives Notification:
    - Once the notification is received, the consumer pulls the data from the provider. In this case, there's no need for the provider to receive further notifications once the data is pulled.


The two main functions of the Gaia-X Service Instance (GX-SI) GX-DELS are:

- Log Notifications into the GX-DELS Inbox: Data Provider and Data Consumer can send notifications on events to the GX-DELS Inbox including a logging token to verify the existence of a contract.
- Query Log Notifications from GX-DELS Inbox: Data Provider and Data Consumer can query Log  Notifications from the GX-DELS. 3rd eligible parties can be enabled to query information from the GX-DELS.

The following figure provides an overview of the main functionality of GX-DELS:

| **Endpoint**              | **Method** |**Description**                                                                                                                                                                                                 |
|-----------------------|----------|-----------------------------------------|
| **/inbox**             | GET | Both Data Provider and Data Consumer (or external GX-DELS Consumer) can query logged notifications. |
| **/inbox/{notification_id}**       | GET | Get the details of a specific notification. |
| **/inbox**      | POST | Sends a notification to the GX-DELS Inbox. |


### Simplified version of the workflow for the GET /inbox API:

1. **Token Validation:** The request must include an Authorization header with a valid token. The system checks this to make sure the request is from a trusted user.

2. **Validate Query Parameters:** The system checks if the query parameters (like page number, limit, or filters) are correct and within allowed ranges.

3. **Retrieve Messages:** Based on the query parameters, the system fetches the inbox messages from the database.

4. **Format Messages:** The system organizes the retrieved messages into a proper format, possibly adding extra info like metadata or cleaning up unnecessary details.

5. **Send Response:** Finally, the system sends the formatted messages back to the client, along with any other useful information, such as pagination details.

This process ensures that the request is authenticated, the parameters are correct, the messages are fetched and prepared properly, and the client gets a well-structured response. </br>
![Get Notifications](docs/get%20inbox.png)

 ### Simplified version of your workflow for the /post inbox API:

1. **Message Validation:** The system first checks if the incoming message is correctly formatted using a validator in the processNotification method.

2. **Token Validation:** The request must include an Authorization header with a valid token. The system checks this to ensure the request is from a legitimate source.

3. **Signature Validation:** The system further verifies the token to make sure it’s properly signed and contains the necessary information.

4. **Add to Queue:** Once the notification passes validation, it gets added to a queue for processing.

5. **Processing from Queue:** The system retrieves the notification from the queue and starts processing it.

6. **Save to Database:** After processing, the system verifies the notification and stores it in the database.

7. **Add to Callback Queue:** If there are more notifications to process, the system adds the next task to a callback queue.

8. **Process Callback Queue:** The next notification is picked from the callback queue and processed.

9. **Notify Participant:** Finally, the system sends a notification to the participant about the status of their request.


This process ensures that the notifications are correctly validated, processed, and the user is informed about the outcome.</br>
![Post Notifications](docs/POST%20inbox.png)
