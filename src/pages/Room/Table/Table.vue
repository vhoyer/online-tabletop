<template>
  <div>
    I'm tables

    <pre v-text="tableRaw" />
  </div>
</template>

<script>
export default {
  name: 'Table',
  props: {
    room: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    props.room.tableCreate()

    return {
      table: props.room.table,
      tableRaw: JSON.stringify(props.room.table, null, 2),
    }
  },
};
</script>
