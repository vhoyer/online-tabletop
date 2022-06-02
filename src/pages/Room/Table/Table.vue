<template>
  <div v-if="false">
    <template v-for="pile in table.objects">
      <Card
        v-for="card in pile.value.deck.stack"
        :key="card.data.default"
        :card="card"
      />
    </template>
  </div>

  <div>
    <Tabletop>
      <TabletopCard
        color="red"
        main="♥J"
        corner="♥J"
      />
    </Tabletop>
  </div>
</template>

<script>
import Card from '@components/Card'
import Tabletop from '@components/Tabletop'
import TabletopCard from '@components/TabletopCard'

export default {
  name: 'Table',
  components: {
    Card,
    Tabletop,
    TabletopCard,
  },
  props: {
    room: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    props.room.tableCreate()

    console.log('[debug][table]', props.room.table)

    props.room.tableSetup()

    return {
      table: props.room.table,
      tableRaw: JSON.stringify(props.room.table, null, 2),
    }
  },
};
</script>
