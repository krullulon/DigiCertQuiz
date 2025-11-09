const quiz = {
  id: "week-2-x9-extended-key-usage",
  title: "DigiCert Weekly Product Quiz #2",
  intro: "This week's focus: Extended Key Usage (EKU) and Chrome clientAuth changes",
  maxTime: 100,
  questions: [
    {
      question: "What best defines extended key usage (EKU) in digital certificates?",
      options: [
        "A field that specifies how long a certificate remains valid before its key expires",
        "A field that lists which algorithms the certificate’s key pair supports",
        "A field that restricts or specifies the purposes for which the certificate’s key can be used",
        "A field that identifies the issuing Certificate Authority’s country and organization",
      ],
      correctAnswer: 2,
    },
    {
      question: "In digital certificates, what does the Client Authentication (clientAuth) EKU specifically indicate?",
      options: [
        "That the certificate is used by a server to prove its identity to clients",
        "That the certificate is used by a client to authenticate itself to a server during mutual TLS",
        "That the certificate allows both client and server authentication in a single session",
        "That the certificate is restricted to code signing and software integrity validation",
      ],
      correctAnswer: 1,
    },
    {
      question:
        "By what date will Chrome stop trusting publicly trusted TLS certificates that include the clientAuth EKU?",
      options: [
        "December 31, 2025",
        "March 1, 2026",
        "June 15, 2026",
        "Chrome has already stopped trusting TLS certificates that include the clientAuth EKU",
      ],
      correctAnswer: 2,
    },
    {
      question: "What is the primary purpose of Google's mandated removal of the clientAuth EKU from publicly trusted TLS certificates?",
      options: [
        "To make all TLS certificates valid for both server and client authentication",
        "To simplify certificate issuance by combining all key usages into a single field",
        "To ensure publicly trusted TLS certificates are used only for server authentication",
        "To phase out the use of HTTPS and transition fully to mutual TLS",
      ],
      correctAnswer: 2,
    },
    {
      question: "A customer needs to maintain client authentication after Chrome stops trusting clientAuth EKUs in public TLS certificates. Which DigiCert solution should you recommend?",
      options: [
        "Multi-domain TLS certificate",
        "Private CA",
        "Public TLS certificate with serverAuth only",
        "DigiCert X9 PKI",
      ],
      correctAnswer: 3,
    },
  ],
};

export default quiz;
