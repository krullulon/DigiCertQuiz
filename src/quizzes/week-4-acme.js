const quiz = {
  id: "week-4-acmes",
  title: "DigiCert Weekly Product Quiz #4",
  intro: "This week's focus: ACME",
  maxTime: 100,
  questions: [
    {
      question: "What does ACME stand for?",
      options: [
        "Automatic Certificate Management Environment",
        "Automated Cryptographic Management Engine",
        "Advanced Certificate Management Exchange",
        "Automated Credential Maintenance Environment",
      ],
      correctAnswer: 0,
    },
    {
      question: "Which of the following statements best describes why ACME is useful?",
      options: [
        "It automates the process of issuing and renewing certificates through a secure protocol",
        "It allows organizations to store private keys in a shared environment",
        "It is used to manage SSH key exchanges for Linux servers",
        "It provides identity verification for Extended Validation (EV) certificates",
      ],
      correctAnswer: 0,
    },
    {
      question:
        "Compared to SCEP and EST, ACME is best suited for:",
      options: [
        "Devices authenticating through mutual TLS inside private networks",
        "Legacy printers and routers without DNS or HTTP endpoints",
        "Public-facing web services that need automated domain-validated certificates",
        "Distributing root CA certificates across enterprise PKI",
      ],
      correctAnswer: 2,
    },
    {
      question: "Which of the following statements about ACME security is true?",
      options: [
        "ACME relies solely on email-based validation for domain control",
        "ACME requires encrypted HTTPS communications between client and server",
        "ACME does not support authentication",
        "ACME shares private keys with the CA for validation",
      ],
      correctAnswer: 1,
    },
    {
      question: "Which of the following best describes how ACME proves domain ownership?",
      options: [
        "By uploading the domain’s SSL certificate to a CA portal",
        "Through challenge validation, such as placing a token in DNS or over HTTP",
        "By emailing the certificate request to the domain registrar",
        "By using a pre-shared key between the client and the CA",
      ],
      correctAnswer: 1,
    },
  ],
};

export default quiz;
