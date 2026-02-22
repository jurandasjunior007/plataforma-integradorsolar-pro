import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sun, Zap, DollarSign, Calendar, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const IRRADIATION_MAP: Record<string, { label: string; value: number }> = {
  SP: { label: 'São Paulo', value: 4.5 },
  MG: { label: 'Minas Gerais', value: 5.0 },
  RJ: { label: 'Rio de Janeiro', value: 4.6 },
  BA: { label: 'Bahia', value: 5.5 },
  CE: { label: 'Ceará', value: 5.8 },
  PE: { label: 'Pernambuco', value: 5.5 },
  PR: { label: 'Paraná', value: 4.5 },
  RS: { label: 'Rio Grande do Sul', value: 4.3 },
  SC: { label: 'Santa Catarina', value: 4.2 },
  GO: { label: 'Goiás', value: 5.2 },
  MT: { label: 'Mato Grosso', value: 5.0 },
  MS: { label: 'Mato Grosso do Sul', value: 5.0 },
  PA: { label: 'Pará', value: 4.8 },
  MA: { label: 'Maranhão', value: 5.5 },
  PI: { label: 'Piauí', value: 5.8 },
  RN: { label: 'Rio Grande do Norte', value: 5.7 },
  PB: { label: 'Paraíba', value: 5.6 },
  AL: { label: 'Alagoas', value: 5.4 },
  SE: { label: 'Sergipe', value: 5.3 },
  ES: { label: 'Espírito Santo', value: 4.8 },
  DF: { label: 'Distrito Federal', value: 5.2 },
  TO: { label: 'Tocantins', value: 5.3 },
  RO: { label: 'Rondônia', value: 4.6 },
  AC: { label: 'Acre', value: 4.4 },
  AM: { label: 'Amazonas', value: 4.3 },
  RR: { label: 'Roraima', value: 4.8 },
  AP: { label: 'Amapá', value: 4.7 },
};

interface SolarDimensionCalcProps {
  dealValue?: number;
  initialData?: {
    consumo?: number;
    tarifa?: number;
    estado?: string;
    perdas?: number;
  };
  onSave?: (data: Record<string, unknown>) => void;
}

export function SolarDimensionCalc({ dealValue, initialData, onSave }: SolarDimensionCalcProps) {
  const [consumo, setConsumo] = useState(initialData?.consumo ?? 0);
  const [tarifa, setTarifa] = useState(initialData?.tarifa ?? 0.85);
  const [estado, setEstado] = useState(initialData?.estado ?? '');
  const [perdas, setPerdas] = useState(initialData?.perdas ?? 20);

  const irradiacao = estado ? IRRADIATION_MAP[estado]?.value ?? 0 : 0;

  const results = useMemo(() => {
    if (!consumo || !irradiacao) return null;
    const perdasFrac = 1 - perdas / 100;
    const potenciaKwp = consumo / (irradiacao * 30 * perdasFrac);
    const paineis = Math.ceil((potenciaKwp * 1000) / 550);
    const economiaMensal = consumo * tarifa;
    const economiaAnual = economiaMensal * 12;
    const paybackAnos = dealValue && dealValue > 0 ? dealValue / economiaAnual : null;

    return {
      potenciaKwp: potenciaKwp.toFixed(2),
      paineis,
      economiaMensal,
      economiaAnual,
      paybackAnos: paybackAnos ? paybackAnos.toFixed(1) : null,
    };
  }, [consumo, irradiacao, perdas, tarifa, dealValue]);

  const handleSave = () => {
    if (!results) return;
    onSave?.({
      solar_consumo: consumo,
      solar_tarifa: tarifa,
      solar_estado: estado,
      solar_perdas: perdas,
      solar_potencia_kwp: results.potenciaKwp,
      solar_paineis: results.paineis,
      solar_economia_mensal: results.economiaMensal,
      solar_economia_anual: results.economiaAnual,
      solar_payback: results.paybackAnos,
    });
    toast({ title: 'Dimensionamento salvo' });
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sun className="h-4 w-4 text-amber-500" />
          Calculador de Dimensionamento Solar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Consumo médio (kWh/mês)</Label>
            <Input
              type="number"
              min={0}
              value={consumo || ''}
              onChange={(e) => setConsumo(Number(e.target.value))}
              placeholder="Ex: 500"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tarifa (R$/kWh)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={tarifa || ''}
              onChange={(e) => setTarifa(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Estado / Irradiação</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(IRRADIATION_MAP).map(([uf, { label, value }]) => (
                  <SelectItem key={uf} value={uf}>
                    {label} ({value} kWh/m²)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Perdas do sistema (%)</Label>
            <Input
              type="number"
              min={0}
              max={50}
              value={perdas || ''}
              onChange={(e) => setPerdas(Number(e.target.value))}
            />
          </div>
        </div>

        {results && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <ResultCard icon={Zap} label="Potência necessária" value={`${results.potenciaKwp} kWp`} />
            <ResultCard icon={Sun} label="Painéis (550Wp)" value={`${results.paineis} un.`} />
            <ResultCard icon={DollarSign} label="Economia mensal" value={fmt(results.economiaMensal)} />
            <ResultCard icon={DollarSign} label="Economia anual" value={fmt(results.economiaAnual)} />
            {results.paybackAnos && (
              <div className="col-span-2">
                <ResultCard icon={Calendar} label="Payback estimado" value={`${results.paybackAnos} anos`} />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={!results}>
            <Save className="h-3.5 w-3.5" />
            Salvar Dimensionamento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
