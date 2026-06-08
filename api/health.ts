type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

export default function handler(_req: unknown, res: JsonResponse) {
  res.status(200).json({
    ok: true,
    service: "lidet-portfolio-api",
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    node: process.version,
  });
}
