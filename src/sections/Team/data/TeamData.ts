import { StaticImageData } from "next/image";
import President from "@/src/assets/team/President.webp";
import VicePresident from "@/src/assets/team/vicePres.webp";
import HeadTech from "@/src/assets/team/HeadTech.webp";
import HeadPr from "@/src/assets/team/HeadPr.webp";
import HeadDocumentation from "@/src/assets/team/HeadDocumentation.webp";
import Advisory from "@/src/assets/team/Advisory.webp";
import AdvisoryHead from "@/src/assets/team/AdvisoryHead.webp";
import DirectorPr from "@/src/assets/team/DirectorPr.webp";

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
    name: "Dhruv Bhandari",
    role: "President",
    description:
      "Leading strategic growth and fostering an ecosystem of innovation and entrepreneurial leadership across campus initiatives.",
    image: President,
    imagePosition: "center 18%",
    directoryImagePosition: "center 10%",
    linkedin: "https://www.linkedin.com/in/dhruv-bhandari-b08041364/",
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
    id: "member-5",
    name: "Ayush S Kulkarni",
    role: "director of Partnerships and Engagements",
    description:
      "builds external relationships and drives member involvement to grow the club's presence and value.",
    image: DirectorPr,
    imagePosition: "center 22%",
    directoryImagePosition: "center 30%",
    linkedin: "https://www.linkedin.com/in/ayushsk",
    accentColor: "#34D399",
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
    id: "member-7",
    name: "Aryav Agrawal",
    role: "Head of PR Team",
    description:
      "Crafting compelling narratives and managing public relations to elevate the club's brand and community engagement.",
    image: HeadPr,
    imagePosition: "center 20%",
    directoryImagePosition: "center 0%",
    linkedin: "https://www.linkedin.com/in/aryav-agrawal-42649b293",
    accentColor: "#FB923C",
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
