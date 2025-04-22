# AWS Cloud Project Project

# 🌐 Cruddur – Ephemeral Micro-Blogging Platform

![Build](https://img.shields.io/github/workflow/status/sonalkrsingh/cruddur/Build?label=build)
![AWS](https://img.shields.io/badge/deployed-AWS-orange)
![CI/CD](https://img.shields.io/badge/CI/CD-CodePipeline-blue)
![Status](https://img.shields.io/badge/status-Production--Ready-brightgreen)

![Cruddur Graphic](_docs/assets/cruddur-banner.jpg)

![Cruddur Screenshot](_docs/assets/cruddur-screenshot.png)

---

Cruddur is a cloud-native, ephemeral-first micro-blogging platform built using a **modern AWS stack**. Designed for scale, security, and learning real-world cloud practices.

## 🚀 Live Demo  
👉🌐 [Access the application](http://cruddur-alb-750766802.ap-south-1.elb.amazonaws.com:3000/)  
🧑‍💻 _Frontend is static React; backend is Flask API containerized on ECS Fargate._

---

## 🛠️ Tech Stack
| Category      | Tools & Services                                                                 |
|---------------|----------------------------------------------------------------------------------|
| **Frontend**  | React.js, S3 static hosting, CloudFront CDN                                      |
| **Backend**   | Flask (Python), ECS Fargate, Docker, ALB                                         |
| **Databases** | Amazon RDS (PostgreSQL), Amazon DynamoDB                                         |
| **Auth**      | Amazon Cognito + Lambda Hook for user sync                                       |
| **Media**     | S3 Presigned URLs, Lambda for processing, CloudFront for asset delivery          |
| **CI/CD**     | AWS CodePipeline, CodeBuild, ECR                                                 |
| **API**       | AWS AppSync (GraphQL + WebSocket Subscriptions), Lambda Authorizer               |
| **Caching**   | Momento Serverless Cache                                                         |
| **Infra as Code** | AWS CloudFormation                                                           |
| **Monitoring**| AWS X-Ray, CloudWatch, Honeycomb, Rollbar              

---

## 🧠 Architecture Diagram 
- [ ] [Architecture](https://lucid.app/lucidchart/fbd6c6bd-ad1b-4d71-a520-b5d3e10fad33/edit?viewport_loc=-1521%2C-3651%2C4192%2C1955%2C0_0&invitationId=inv_4a703e12-0cc7-4e71-9882-d333a9972d9c)

## 🧑‍💻 Author

**Sonal Kumar Singh**  
📧 sonalkumar2790@gmail.com  
[LinkedIn](https://www.linkedin.com/in/sonal-kumar-singh-5b5b171a4/) | [GitHub](https://github.com/sonalkrsingh)

---
