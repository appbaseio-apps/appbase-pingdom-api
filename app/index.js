import React, { Component } from "react";
import ReactDOM from "react-dom";
import https from "https";
import ReactHighcharts from "react-highcharts";
class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {},
			checks: [],
			ignore: ["scalr frontend up", "scalr es cluster 1 up","scalr pushpin up","scalr es cluster 2 up"] // Checks to be ingored. Note: check name in lowercase
		}
		this.componentDidMount = this.componentDidMount.bind(this);
		this.request = this.request.bind(this);
		this.set = this.set.bind(this);
	}

	set(d, chks) {
		this.setState({
			data: d,
			checks: chks,
			ignore: this.state.ignore
		})
	}

	request() {
		let data = "";
		let func = this.set;
		// console.log("heyy!!");
		https.get('http://ec2-34-206-1-57.compute-1.amazonaws.com:8000/', function (response) {
			response.setEncoding('utf8');
			response.on('error',function (error) {
				// body...
				console.log(error);
			})
			response.on("data", function (d) {
				data += d;
			});

			response.on('end', function () {
				// console.log(data);
				let jobj = JSON.parse(data);
				func(jobj,jobj.checks);
				// let array = [];
				// JSON.parse(data).checks.map(item => { array.push(item.id) })
				// func(array);
			});

		});
	}

	fetcho(item){
		let id = item.id;
		// debugger;
		// console.log(typeof this.state.data[id]);
		// debugger;
		if(this.state.data[id]!=="" && this.state.ignore.indexOf(item.name.toLowerCase())<0 ) {
			let parseJson=(JSON.parse(this.state.data[id]));
			// debugger;
			let data=parseJson.summary.hours;
			let graphData=[];
			let xAixData=[];
			let i=20;
			data.map(item=>{
				let time=new Date(new Date().getTime()  - (60 * 60*1000) * i);
				graphData.push([time.toLocaleTimeString(),item.avgresponse]);
				let ampm="am";
				let hr=time.getHours();
				if(hr>12){
					hr=hr-12;
					ampm="pm";
				}
				else if(hr==0){
					hr=12;
					// am
				}
				xAixData.push(`${hr} ${ampm}`);
				
				i=i-1;
			});
			// console.log(graphData);
			// console.log(xAixData);
			let getpos= function(){
				return {x:5,y:5};
			}
			let config = {
			  xAxis: {
			    categories: xAixData
			  },

			  yAxis:{
			  	units: [
			  	['millisecond', [100]]
			  	],
			  	title: {
			  		text:"milliseconds"
			  	}
			  },
			  series: [{
			  	name: "avg response time ",
			    data: graphData,
			    tooltip: {
			      valueSuffix: "ms"
			    }
			  }],
			  rangeSelector: {
			    selected: 1
			  },
			  chart: {
			    // "width": "600",
			    "height": "200",
			    backgroundColor: "",
			  },

			  title:{
			  	align:"left",
			  	text: item.name.toUpperCase()
			  },
			  legend: {
			  	enabled : false
			  } 
			};
			// console.log(config)
			return (
				<li className="row">
					
						<ReactHighcharts config={config} ref={"chart"+id}>{id}</ReactHighcharts>
					
				</li>
				);
		}
		// return (<div></div>);
	}

	componentDidMount() {
		this.request();
		//console.log(this.state.data);

	}

	render() {
		return (
			<div className="statusblock">
				<ul key={this.state.data}>
				<div>
				{this.state.checks.map(item =>{return (<div className="checkblock" key={item.id}> {this.fetcho(item)} </div>)})}
				</div>
				</ul>
			</div>
		);
	}
}
ReactDOM.render(<App />, document.getElementById("app"));
