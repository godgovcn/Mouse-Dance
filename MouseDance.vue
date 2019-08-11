<template>
  <div id="mousedance">
    <div id="md-bar" :style="{left:(mdswitch ? '0px':'-230px')}">
      <div>
        <div v-if="!state">
          <input type="text" placeholder="输入你的昵称开始搞事" v-model="self.name" />
          <input type="button" :disabled="!self.name" value="搞起" @click="start()" />
        </div>
        <div v-else>
          <input type="text" placeholder="来一发你的女装宣言" v-model="self.msg" />
          <input type="button" value="退出" @click="stop()" />
        </div>
      </div>
      <div id="md-switch" @click="mdswitch=!mdswitch">
        <div id="md-switch-style" :class="[mdswitch ? 'md-open' : 'md-close', 'md-style']"></div>
      </div>
    </div>

    <div
      id="selfmsg"
      class="msg"
      v-if="state"
      :style="{left:self.rawX+25+'px',top:self.rawY-5+'px'}"
    >{{self.msg}}</div>
    <div
      id="selfname"
      class="name"
      v-if="state"
      :style="{left:self.rawX+38+'px',top:self.rawY-25+'px'}"
    >{{self.name}}</div>
    <template v-for="(v,i) in usr">
      <div :key="i+1+'mouse'" class="mouse" v-if="state" :style="{left:v.rawX+'px',top:v.rawY+'px'}"></div>
      <div
        :key="i+1+'msg'"
        class="msg"
        v-if="state"
        :style="{left:v.rawX+25+'px',top:v.rawY-5+'px'}"
      >{{v.msg}}</div>
      <div
        :key="i+1+'name'"
        class="name"
        v-if="state"
        :style="{left:v.rawX+38+'px',top:v.rawY-25+'px'}"
      >{{v.name}}</div>
    </template>
  </div>
</template>

<script>
export default {
  name: "MouseDance",
  data() {
    return {
      state: false,
      mdswitch: false,
      ws: false,
      self: {
        id: "",
        x: 0,
        y: 0,
        rawX: 0,
        rawY: 0,
        name: "",
        msg: ""
      },
      usr: [],
      online: 0
    };
  },
  mounted() {},
  methods: {
    start: function() {
      var that = this;
      this.getMouse(event);
      window.onmousemove = function(e) {
        that.getMouse(e);
      };
      that.ws = new WebSocket("ws://localhost:3000");
      that.ws.onopen = function(evt) {
        that.ws.send(
          JSON.stringify({
            state: "login",
            inf: {
              x: that.self.x,
              y: that.self.y,
              name: that.self.name
            }
          })
        );
      };
      that.ws.onmessage = function(evt) {
        var data = JSON.parse(evt.data);
        if (data.state == "login") {
          that.self.id = data.id;
        }
        if (data.state == "push") {
          that.usr = [];
          for (var i in data.data) {
            if (i == that.self.id) {
              continue;
            }
            that.usr.push({
              name: data.data[i].name,
              msg: data.data[i].msg,
              rawX: (data.data[i].x * window.innerWidth) / 100,
              rawY: (data.data[i].y * window.innerHeight) / 100
            });
          }
          that.online = data.online;
        }
      };
      that.ws.onclose = function() {
        that.stop();
      };
      this.state = true;
    },
    stop: function() {
      window.onmousemove = null;
      this.state = false;
      this.self.msg = "";
      this.ws.close();
    },
    getMouse: function(e) {
      this.self.x = (e.clientX / window.innerWidth) * 100;
      this.self.y = (e.clientY / window.innerHeight) * 100;
      this.self.rawX = e.clientX;
      this.self.rawY = e.clientY;
    }
  },
  watch: {
    self: {
      handler(e) {
        var that = this;
        this.ws.send(
          JSON.stringify({
            state: "update",
            inf: {
              id: that.self.id,
              x: that.self.x,
              y: that.self.y,
              msg: that.self.msg
            }
          })
        );
      },
      deep: true
    }
  }
};
</script>

<style scoped>
#md-bar {
  display: block;
  position: fixed;
  bottom: 50px;
  background-color: white;
  box-shadow: 0 0 10px #ccc;
  transition: 0.5s;
  margin: 0px;
  padding: 3px 5px;
  height: 23px;
  width: 230px;
}
#md-switch {
  left: 230px;
  display: block;
  width: 20px;
  position: absolute;
  height: 29px;
  top: 0;
  box-shadow: 0 0 10px #ccc;
  background: rgb(102, 204, 153);
}
.md-style {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
}
.md-open {
  border-right: 7px solid #fff;
}
.md-close {
  border-left: 7px solid #fff;
}
.name {
  position: fixed;
  font-size: 14px;
}
.mouse {
  position: fixed;
  width: 12px;
  height: 19px;
  background-image: url('./assets/mouse.png')
}
.msg {
  display: block;
  position: fixed;
  cursor: default;
  width: 200px;
  height: auto;
  padding: 3px 5px;
  border: 2px solid rgb(0, 132, 255);
  border-radius: 5px;
  background-color: white;
  min-height: 21px;
  word-wrap: break-word;
}
.msg::before {
  content: "";
  width: 0;
  height: 0;
  border: 10px solid;
  position: absolute;
  top: 3px;
  left: -20px;
  border-color: transparent rgb(0, 132, 255) transparent transparent;
}
.msg::after {
  content: "";
  width: 0;
  height: 0;
  border: 7px solid;
  position: absolute;
  top: 6px;
  left: -14px;
  border-color: transparent white transparent transparent;
}
</style>
