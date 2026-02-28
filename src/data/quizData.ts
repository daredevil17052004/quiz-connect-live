export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export const quizQuestions: QuizQuestion[] = [
  // Easy Questions
  {
    question: "Which AWS service provides a persistent block storage volume for use with Amazon EC2 instances?",
    options: ["Amazon S3", "Amazon EBS", "Amazon Glacier", "Amazon FSx"],
    correctAnswer: 1,
  },
  {
    question: "What is the primary function of Amazon SNS?",
    options: ["Database management", "Notification and messaging service", "Serverless compute", "DNS routing"],
    correctAnswer: 1,
  },
  {
    question: "Which component is the fundamental building block of a private network environment within the AWS cloud?",
    options: ["VPC (Virtual Private Cloud)", "CloudFront", "SNS", "SQS"],
    correctAnswer: 0,
  },
  {
    question: "Which AWS pricing model offers the most significant discount in exchange for a long-term (1-3 year) commitment?",
    options: ["On-Demand", "Spot Instances", "Reserved Instances", "Free Tier"],
    correctAnswer: 2,
  },
  {
    question: "What does the term 'Scalability' specifically refer to in cloud computing?",
    options: ["Increasing application color theme", "Ability to increase or decrease resources as needed", "Changing operating system", "Reducing storage permanently"],
    correctAnswer: 1,
  },
  // Medium Questions
  {
    question: "Which service is a fully managed NoSQL database provided by AWS?",
    options: ["Amazon RDS", "Amazon DynamoDB", "Amazon Redshift", "Amazon Aurora"],
    correctAnswer: 1,
  },
  {
    question: "Which AWS service allows you to deploy and scale web applications quickly without worrying about the underlying infrastructure?",
    options: ["AWS Elastic Beanstalk", "Amazon EC2", "Amazon VPC", "AWS IAM"],
    correctAnswer: 0,
  },
  {
    question: "What does Amazon SQS primarily provide for distributed applications?",
    options: ["A managed SQL database", "A fully managed message queuing service", "A storage bucket for large files", "Performance monitoring tools"],
    correctAnswer: 1,
  },
  {
    question: "Which service is used to record and audit API calls across your AWS infrastructure for security and compliance?",
    options: ["Amazon CloudWatch", "AWS CloudTrail", "AWS Config", "Amazon Inspector"],
    correctAnswer: 1,
  },
  {
    question: "What is a 'Docker Image' in the context of containerization?",
    options: ["Running container instance", "A blueprint for creating containers", "A virtual machine", "A network protocol"],
    correctAnswer: 1,
  },
  {
    question: "Which AWS service provides a managed environment specifically for running Kubernetes clusters?",
    options: ["Amazon ECS", "Amazon EKS", "AWS Lambda", "AWS Elastic Beanstalk"],
    correctAnswer: 1,
  },
  // Hard Questions
  {
    question: "In DevOps, what is the core concept behind 'Immutable Infrastructure'?",
    options: ["Updating servers in place", "Replacing servers instead of modifying them", "Manual configuration", "Shared database architecture"],
    correctAnswer: 1,
  },
  {
    question: "What is the primary architectural benefit of deploying an Amazon RDS database in a Multi-AZ configuration?",
    options: ["Lower cost", "Automatic failover & high availability", "Faster queries only", "More storage space"],
    correctAnswer: 1,
  },
  {
    question: "Which strategy helps reduce downtime during application updates by shifting traffic to a small group of users first?",
    options: ["Canary Deployment", "Single instance deployment", "Disabling load balancer", "Manual patching"],
    correctAnswer: 0,
  },
  {
    question: "To establish a dedicated, private network connection from an on-premises data center to AWS, which service is used?",
    options: ["Amazon Route 53", "AWS Direct Connect", "Amazon CloudFront", "AWS API Gateway"],
    correctAnswer: 1,
  },
];
