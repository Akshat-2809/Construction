// import { MetadataRoute } from "next";

// export default function sitemap(): MetadataRoute.Sitemap {
//   return [
//     {
//       url: "https://myequipo.com",
//       lastModified: new Date(),
//       changeFrequency: "daily",
//       priority: 1,
//     },
//     {
//       url: "https://myequipo.com/machinery",
//       lastModified: new Date(),
//       changeFrequency: "hourly",
//       priority: 0.9,
//     },
//     {
//       url: "https://myequipo.com/machinery/request",
//       lastModified: new Date(),
//       changeFrequency: "daily",
//       priority: 0.8,
//     },
//     {
//       url: "https://myequipo.com/machinery/register",
//       lastModified: new Date(),
//       changeFrequency: "monthly",
//       priority: 0.7,
//     },
//     {
//       url: "https://myequipo.com/help",
//       lastModified: new Date(),
//       changeFrequency: "monthly",
//       priority: 0.5,
//     },
//     {
//       url: "https://myequipo.com/auth",
//       lastModified: new Date(),
//       changeFrequency: "monthly",
//       priority: 0.3,
//     },
//   ];
// }





import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://myequipo.com", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://myequipo.com/machinery", lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: "https://myequipo.com/machinery/request", lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: "https://myequipo.com/machinery/register", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://myequipo.com/help", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://myequipo.com/auth", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}