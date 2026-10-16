import { StaticImageData } from "next/image";
import VicePresident from "@/src/assets/team/vicePres.webp";
import HeadTech from "@/src/assets/team/HeadTech.webp";
import HeadDesign from "@/src/assets/team/HeadDesign.webp";
import HeadDocumentation from "@/src/assets/team/HeadDocumentation.webp";
import Advisory from "@/src/assets/team/Advisory.webp";
import AdvisoryHead from "@/src/assets/team/AdvisoryHead.webp";
import DirectorPr from "@/src/assets/team/DirectorPr.webp";
import PrExecutive from "@/src/assets/team/PrExecutive.webp";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: StaticImageData | string;
  imagePosition?: string;
  directoryImagePosition?: string;
  linkedin: string;
  accentColor?: string;
}

const teamMembers: TeamMember[] = [
  {
    id: "member-1",
    name: "Vanshaj",
    role: "Advisory Head",
    description:
      "Steering the advisory council and shaping governance frameworks to ensure sustainable organizational excellence.",
    image: AdvisoryHead,
    imagePosition: "center 20%",
    directoryImagePosition: "center 10%",
    linkedin: "https://www.linkedin.com/in/vanshajgargg/",
    accentColor: "#EF4444",
  },
  {
    id: "member-2",
    name: "Jaineesh Patel",
    role: "Advisory",
    description:
      "Providing strategic counsel and mentorship to guide the club's vision and long-term growth trajectory.",
    image: Advisory,
    imagePosition: "center 10%",
    directoryImagePosition: "center 80%",
    linkedin: "https://www.linkedin.com/in/jaineesh-patel-6471902a7",
    accentColor: "#38BDF8",
  },
  {
    id: "member-3",
    name: "Ayush S Kulkarni",
    role: "President",
    description:
      "Leading strategic growth and fostering an ecosystem of innovation and entrepreneurial leadership across campus initiatives.",
    image: DirectorPr,
    imagePosition: "center 22%",
    directoryImagePosition: "center 30%",
    linkedin: "https://www.linkedin.com/in/ayushsk",
    accentColor: "#F59E0B",
  },
  {
    id: "member-4",
    name: "Lavanya Sodhani",
    role: "Vice-President",
    description:
      "Driving operational excellence and coordinating cross-functional teams to amplify the club's impact and outreach.",
    image: VicePresident,
    imagePosition: "center 22%",
    directoryImagePosition: "center 50%",
    linkedin: "https://www.linkedin.com/in/lavanya-s006/",
    accentColor: "#F472B6",
  },
  {
    id: "member-6",
    name: "Akash Singh Bisht",
    role: "Head of Tech",
    description:
      "Architecting digital products, developer platforms, and technical infrastructure powering the club's digital presence.",
    image: HeadTech,
    imagePosition: "center 20%",
    directoryImagePosition: "center 40%",
    linkedin: "https://www.linkedin.com/in/akash-bisht-601268322?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    accentColor: "#3B82F6",
  },
  {
    id: "member-5",
    name: "Suyash Chandra",
    role: "PR Executive",
    description:
      "Bringing sponsors, judges, and industry partners on board to power every event the club hosts.",
    image: PrExecutive,
    imagePosition: "center 30%",
    directoryImagePosition: "center 35%",
    linkedin: "https://www.linkedin.com/in/suyash-chandra?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    accentColor: "#34D399",
  },
  {
    id: "member-7",
    name: "Anagha Anish",
    role: "Head of Design",
    description:
      "Shaping the club's visual identity and crafting design systems that bring every event and initiative to life.",
    image: HeadDesign,
    imagePosition: "center 25%",
    directoryImagePosition: "center 25%",
    linkedin: "https://www.linkedin.com/in/anagha-anish/",
    accentColor: "#A78BFA",
  },
  {
    id: "member-8",
    name: "Payal A Singh",
    role: "Documentation Team Co-Lead",
    description:
      "Orchestrating comprehensive documentation and content strategy to preserve and share the club's knowledge base.",
    image: HeadDocumentation,
    imagePosition: "center 20%",
    directoryImagePosition: "center 18%",
    linkedin: "https://www.linkedin.com/in/payal-singh-8601b5378/",
    accentColor: "#2DD4BF",
  },
];

export default teamMembers;
