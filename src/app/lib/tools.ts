// src/lib/tools.ts
export function getComponents(platform: string) {
  return {
    platform,
    components: [
      { id: "button", name: "Button", props: { color: "blue", text: "Click" } },
      { id: "card", name: "Card", props: { title: "Card", description: "Details" } },
    ],
  };
}

export function updateComponent(componentId: string, updates: any) {
  return `Component ${componentId} updated with ${JSON.stringify(updates)} (mock approval required).`;
}
  