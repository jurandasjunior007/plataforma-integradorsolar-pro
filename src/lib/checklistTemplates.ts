export const SOLAR_CHECKLIST_TEMPLATES = [
  {
    stageName: 'Prospecção / Qualificação',
    checklists: [
      {
        title: 'QUALIFICAÇÃO DO LEAD',
        items: [
          { title: 'Telefone de contato preenchido', linked_field: 'contact_id', is_required: true, block_stage_advance: true },
          { title: 'Tipo de cliente definido (PF ou PJ)', linked_field: 'custom_fields.tipo_cliente', is_required: true, block_stage_advance: false },
          { title: 'Origem do lead registrada', linked_field: null, is_required: false, block_stage_advance: false },
        ]
      }
    ]
  },
  {
    stageName: 'Levantamento Técnico',
    checklists: [
      {
        title: 'DADOS TÉCNICOS',
        items: [
          { title: 'Consumo médio mensal (kWh) preenchido', linked_field: 'custom_fields.consumo_kwh', is_required: true, block_stage_advance: true },
          { title: 'Tipo de telhado selecionado', linked_field: 'custom_fields.tipo_telhado', is_required: true, block_stage_advance: true },
          { title: 'Tarifa de energia informada', linked_field: 'custom_fields.tarifa_energia', is_required: true, block_stage_advance: false },
          { title: 'Visita técnica realizada', linked_field: 'custom_fields.visita_realizada', is_required: true, block_stage_advance: true },
        ]
      }
    ]
  },
  {
    stageName: 'Proposta Enviada',
    checklists: [
      {
        title: 'PROPOSTA COMERCIAL',
        items: [
          { title: 'Valor do projeto preenchido', linked_field: 'value', is_required: true, block_stage_advance: true },
          { title: 'Potência do sistema (kWp) calculada', linked_field: 'custom_fields.potencia_kwp', is_required: true, block_stage_advance: true },
          { title: 'Contato vinculado ao negócio', linked_field: 'contact_id', is_required: true, block_stage_advance: true },
          { title: 'Proposta aprovada pelo cliente', linked_field: 'custom_fields.proposta_aprovada', is_required: true, block_stage_advance: false },
        ]
      }
    ]
  },
  {
    stageName: 'Fechamento',
    checklists: [
      {
        title: 'DOCUMENTAÇÃO',
        items: [
          { title: 'Forma de pagamento definida', linked_field: 'custom_fields.forma_pagamento', is_required: true, block_stage_advance: true },
          { title: 'Contrato assinado', linked_field: 'custom_fields.contrato_assinado', is_required: true, block_stage_advance: true },
          { title: 'Data de instalação confirmada', linked_field: 'custom_fields.data_instalacao', is_required: true, block_stage_advance: true },
        ]
      }
    ]
  },
  {
    stageName: 'Instalação',
    checklists: [
      {
        title: 'EXECUÇÃO',
        items: [
          { title: 'Equipamentos entregues', linked_field: null, is_required: true, block_stage_advance: true },
          { title: 'Instalação concluída', linked_field: null, is_required: true, block_stage_advance: true },
          { title: 'ART registrada', linked_field: null, is_required: true, block_stage_advance: true },
          { title: 'Cliente treinado no sistema', linked_field: null, is_required: false, block_stage_advance: false },
        ]
      }
    ]
  },
  {
    stageName: 'Homologação',
    checklists: [
      {
        title: 'CONEXÃO À REDE',
        items: [
          { title: 'Solicitação enviada à distribuidora', linked_field: 'custom_fields.homolog_enviada', is_required: true, block_stage_advance: true },
          { title: 'Número do processo de homologação', linked_field: 'custom_fields.num_homologacao', is_required: true, block_stage_advance: true },
          { title: 'Vistoria aprovada', linked_field: null, is_required: true, block_stage_advance: true },
          { title: 'Sistema gerando energia confirmado', linked_field: null, is_required: true, block_stage_advance: true },
        ]
      }
    ]
  },
  {
    stageName: 'Pós-Venda',
    checklists: [
      {
        title: 'FINALIZAÇÃO',
        items: [
          { title: 'Pagamento total quitado', linked_field: 'custom_fields.pagamento_quitado', is_required: true, block_stage_advance: true },
          { title: 'NF-e emitida', linked_field: 'custom_fields.nfe_emitida', is_required: true, block_stage_advance: true },
          { title: 'Pesquisa de satisfação enviada', linked_field: null, is_required: false, block_stage_advance: false },
          { title: 'Indicação solicitada ao cliente', linked_field: null, is_required: false, block_stage_advance: false },
        ]
      }
    ]
  },
];
