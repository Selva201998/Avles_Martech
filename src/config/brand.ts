/**
 * Product identity. Everything user-facing that names the product reads from here,
 * so the demo can be re-skinned for another workspace without touching components.
 */
export const BRAND = {
  productName: 'Avles',
  tagline: 'AI-powered Marketing Operations & Lifecycle Automation.',
  workspaceName: 'Demo Workspace',
  workspaceDescriptor: 'Subscription app · sample data',
  viewerName: 'Guest Viewer',
  viewerRole: 'Read-only demo session',
  demoBadge: 'Illustrative Demo',
  sampleDataNotice: 'Illustrative Demo — Sample Data',
  disclaimer:
    'All metrics, users and events in this workspace are synthetic sample data generated for demonstration. ' +
    'They are not connected to a production system and do not represent verified business results. ' +
    'Avles is a fictional product and is not affiliated with any real company.',
} as const;
