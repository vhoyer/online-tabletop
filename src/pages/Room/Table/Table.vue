<template>
  <div>
    <template v-for="pile in table.objects">
      <Card
        v-for="card in pile.value.deck.stack"
        :key="card.data.default"
        :card="card"
      />
    </template>
  </div>
</template>

<script>
import Card from '@components/Card'

export default {
  name: 'Table',
  components: {
    Card,
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

    return {
      table: props.room.table,
      tableRaw: JSON.stringify(props.room.table, null, 2),
    }
  },
};
</script>
