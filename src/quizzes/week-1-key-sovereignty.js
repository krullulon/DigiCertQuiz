const quiz = {
  id: "week-1-key-sovereignty",
  title: "DigiCert Weekly Product Quiz #1",
  intro: "This week's quiz focuses on key sovereignty",
  maxTime: 100,
  questions: [
    {
      question: "What best defines key sovereignty?",
      options: [
        "The right of an organization to choose any cloud provider it wants",
        "The principle that organizations must retain full control and ownership of their cryptographic keys, without reliance on external jurisdictions",
        "The process of backing up encryption keys to multiple cloud regions for redundancy",
        "The practice of sharing encryption keys between partner organizations to ensure interoperability",
      ],
      correctAnswer: 1,
    },
    {
      question: "Why is key sovereignty important for global organizations?",
      options: [
        "It helps reduce the cost of encryption hardware",
        "It allows data to be encrypted across multiple clouds",
        "It ensures compliance with data privacy laws and prevents unauthorized access by foreign entities",
        "It simplified password management for employees",
      ],
      correctAnswer: 2,
    },
    {
      question:
        "What is the best DigiCert solution to provide key sovereignty for customers?",
      options: [
        "On-prem DC1: entire DigiCert ONE hosted by customer on premise",
        "Regional DC1: entire DigiCert ONE hosted in regional cloud",
        "On-prem hybrid: on-prem private CA for certificate issuance & DigiCert ONE hosted DC1 visibility and management",
        "None of the above",
      ],
      correctAnswer: 2,
    },
    {
      question: "Which of the following supports key sovereignty?",
      options: [
        "Using a cloud provider's default encryption keys",
        "Storing keys in Hardware Security Modules (HSMs) controlled by the customer",
        "Allowing third parties to rotate encryption keys automatically",
        "Sharing encryption keys with the cloud provider for backup",
      ],
      correctAnswer: 1,
    },
    {
      question:
        "What is DigiCert's position on offering private CA to customers",
      options: [
        "Always offer our multi-tenant SaaS private CA",
        "Always offer our On-Prem CA",
        "Always lead with multi-tenant SaaS private CA but offer On-Prem CA if key sovereignty is a deal-breaker",
        "Present both options to the customer: multi-tenant SaaS private CA and On-Prem CA Hybrid",
      ],
      correctAnswer: 2,
    },
  ],
};

export default quiz;
