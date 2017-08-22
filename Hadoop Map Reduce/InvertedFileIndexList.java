
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


import java.util.StringTokenizer;

public class InvertedFileIndexList {

    public static class InvertedFileIndexListMapper
            extends Mapper<Object, Text, Text, Text> {

        private Text docID = new Text();
        private Text word = new Text();

        public void map(Object key, Text value, Context context)
                throws IOException, InterruptedException {
            StringTokenizer docSep = new StringTokenizer(value.toString(), "\t");
            docID.set(docSep.nextToken());
            StringTokenizer itr = new StringTokenizer(docSep.nextToken());
            while (itr.hasMoreTokens()) {
                word.set(itr.nextToken());
                context.write(word, docID);
            }
        }
    }


    public static class InvertedFileIndexListReducer extends Reducer<Text, Text, Text, Text> {
        public void reduce(Text object, Iterable<Text> paramIterable,
                           Reducer<Text, Text, Text, Text>.Context context) throws IOException, InterruptedException {
            Map<String, Integer> hashMap = new HashMap<String, Integer>();
            int counter = 0;
            for (Text localText : paramIterable) {
                String str = localText.toString();
                if (hashMap.containsKey(str))
                    counter++;
                else
                    counter = 1;
                hashMap.put(str, Integer.valueOf(counter));
            }
            context.write(object, new Text(hashMap.toString()));
        }

//        String previous = "";
//        String current = "";
//        Map<String, Integer> lineMap = new HashMap<String, Integer>();
//        String temp = "";
//        int counter = 0;
//            for (Text localText : paramIterable) {
//            current = localText.toString();
//            if (!current.equals(previous)) {
//                if (current.split(" ")[0].equals(previous.split(" ")[0])) {
//                    lineMap.put(current.split(" ")[1], 1);
//                } else {
//                    if (previous.length() == 0) {
//                        lineMap.put(current.split(" ")[1], 1);
//                    } else {
//                        temp = "";
//                        for (String temp1 : lineMap.keySet()) {
//                            temp += temp1 + ":"+ lineMap.get(temp1) +"\t";
//                        }
//                        context.write(new Text(previous.split(" ")[0]), new Text( temp));
//                        lineMap = new HashMap<String, Integer>();
//                        lineMap.put(current.split(" ")[1], 1);
//                    }
//                }
//            } else {
//                lineMap.put(current.split(" ")[1], lineMap.get(current.split(" ")[1]) + 1);
//            }
//            previous = current;
//        }
//        temp="";
//            for (String temp1 : lineMap.keySet()) {
//            temp += temp1 + ":"+ lineMap.get(temp1) +"\t";
//        }
//            context.write(new Text(previous.split(" ")[0]), new Text( temp));
    }

    public static void main(String[] paramArrayOfString) throws Exception {
        Configuration localConfiguration = new Configuration();
        Job localJob = new Job(localConfiguration, "InvertedFileIndexList");
        localJob.setJarByClass(InvertedFileIndexList.class);
        localJob.setMapperClass(InvertedFileIndexList.InvertedFileIndexListMapper.class);
        localJob.setReducerClass(InvertedFileIndexList.InvertedFileIndexListReducer.class);
        localJob.setMapOutputKeyClass(Text.class);
        localJob.setMapOutputValueClass(Text.class);
        localJob.setOutputKeyClass(Text.class);
        localJob.setOutputValueClass(org.apache.hadoop.io.IntWritable.class);
        org.apache.hadoop.mapreduce.lib.input.FileInputFormat.addInputPath(localJob, new Path(paramArrayOfString[0]));
        FileOutputFormat.setOutputPath(localJob, new Path(paramArrayOfString[1]));
        System.exit(localJob.waitForCompletion(true) ? 0 : 1);
    }
}