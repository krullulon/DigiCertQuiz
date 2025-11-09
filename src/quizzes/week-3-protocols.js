const quiz = {
  id: "week-3-protocols",
  title: "DigiCert Weekly Product Quiz #3",
  intro: "This week's focus: protocols, including ACME, SCEP, CMPv2, and EST",
  maxTime: 100,
  questions: [
    {
      question: "Which of the following best defines a secure communication protocol?",
      options: [
        "A specification that ensures data is transmitted quickly across a network",
        "A set of rules that protects data during transmission through encryption and authentication",
        "A service that scans network traffic for malicious activity",
        "A programming interface used to develop encrypted applications",
      ],
      correctAnswer: 1,
    },
    {
      question: "Which of the secure communication protocols below is supported by DigiCert ONE?",
      options: [
        "ACME",
        "SCEP",
        "EST",
        "All of the above",
      ],
      correctAnswer: 3,
    },
    {
      question:
        "A DevOps team manages 500 microservices that each expose HTTPS endpoints. Certificates expire every 90 days. What’s the best protocol for them? ",
      options: [
        "EST",
        "ACME",
        "SCEP",
        "OCSP",
      ],
      correctAnswer: 1,
    },
    {
      question: "A manufacturing company has hundreds of legacy IoT sensors and network appliances that cannot support HTTPS or mutual TLS but still need digital certificates for secure communication. Which certificate enrollment protocol should they implement?",
      options: [
        "ACME",
        "EST",
        "SCEP",
        "CMPv2",
      ],
      correctAnswer: 2,
    },
    {
      question: "A healthcare organization needs to issue and renew certificates for medical devices connected to its internal network. These devices must authenticate securely using existing certificates and communicate over mutual TLS (mTLS) with the certificate authority. Which protocol best meets these requirements?",
      options: [
        "ACME",
        "EST",
        "SCEP",
        "OCSP",
      ],
      correctAnswer: 1,
    },
  ],
};

export default quiz;
