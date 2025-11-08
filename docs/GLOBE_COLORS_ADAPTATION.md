# 🌍 Adaptação de Cores do Globe - Azul para Verde

## Cores Adaptadas

### Cores Principais:
- **globeColor**: `#064e3b` (Verde escuro - era roxo `#1d072e`)
- **atmosphereColor**: `#a7f3d0` (Verde claro - era branco `#ffffff`)
- **polygonColor**: `rgba(34, 197, 94, 0.7)` (Verde semi-transparente - era branco)
- **emissive**: `#065f46` (Verde muito escuro - era preto `#000000`)

### Iluminação (Luzes):
- **ambientLight**: `#86efac` (Verde médio claro)
- **directionalLeftLight**: `#4ade80` (Verde médio)
- **directionalTopLight**: `#22c55e` (Verde)
- **pointLight**: `#16a34a` (Verde escuro)

### Efeitos:
- **Fog**: `0xa7f3d0` (Verde claro - era branco `0xffffff`)
- **clearColor**: `0xa7f3d0` (Verde claro - era `0xffaaff`)

## Paleta de Verdes Usada:
- `#064e3b` - Verde muito escuro (globo)
- `#065f46` - Verde escuro (emissão)
- `#16a34a` - Verde escuro (point light)
- `#22c55e` - Verde (directional top)
- `#34c55e` - Verde médio (polygon)
- `#4ade80` - Verde médio claro (directional left)
- `#86efac` - Verde claro (ambient)
- `#a7f3d0` - Verde muito claro (atmosfera/fog)

## Dependências Necessárias:

```bash
npm i three three-globe @react-three/fiber@alpha @react-three/drei
```

## Arquivo Necessário:
- `src/data/globe.json` - Dados dos países (precisa ser baixado ou criado)

