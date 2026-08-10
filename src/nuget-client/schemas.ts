import z from "zod";

const NuGetVersionSchema = z.object({
  version: z.string().optional(),
});

const NuGetPackageTypeSchema = z.object({
  name: z.string().optional(),
});

const NuGetVulnSchema = z.object({
  advisoryUrl: z.string().optional(),
  severity: z.string().optional(),
});

const NuGetAltPackageSchema = z.object({
  id: z.string().optional(),
  range: z.string().optional(),
});

const NuGetDeprecationSchema = z.object({
  message: z.string().optional(),
  reasons: z.array(z.string()).optional(),
  alternatePackage: NuGetAltPackageSchema,
});

const NuGetSearchDataSchema = z.object({
  id: z.string().optional(),
  version: z.string().optional(),
  description: z.string().optional(),
  totalDownloads: z.number(),
  projectUrl: z.string().optional(),
  licenseUrl: z.string().optional(),
  licenseExpression: z.string().optional(),
  repositoryUrl: z.string().optional(),
  authors: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  versions: z.array(NuGetVersionSchema).optional(),
  verified: z.boolean(),
  packageTypes: z.array(NuGetPackageTypeSchema).optional(),
  vulnerabilities: z.array(NuGetVulnSchema).optional(),
  deprecation: NuGetDeprecationSchema.optional(),
});

export const NuGetSearchResponseSchema = z.object({
  data: z.array(NuGetSearchDataSchema),
});

export type NuGetSearchData = z.infer<typeof NuGetSearchDataSchema>;
