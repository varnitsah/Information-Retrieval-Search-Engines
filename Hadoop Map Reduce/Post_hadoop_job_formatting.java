package com.company;

/**
 * Created by Varnit Sah on 3/23/2017.
 */
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;

public class Post_hadoop_job_formatting {

    public static void main(String[] args) {
        String sourceFileName = "Placeholder" //PAth of .txt file from -getmerge command;
        String destinationFileName = "Placeholder" //Path of final formatted file;
        copyFile(sourceFileName, destinationFileName);
    }

    private static void copyFile(String sourceFileName,String destinationFileName) {

        BufferedReader br = null;
        PrintWriter pw = null;

        try {
            br = new BufferedReader(new FileReader( sourceFileName ));
            pw =  new PrintWriter(new FileWriter( destinationFileName ));

            String line;
            while ((line = br.readLine()) != null) {

                line = line.replace("{","" );
                line = line.replace("}","" );
                line = line.replace(",","" );
                line = line.replace("=",":" );
                System.out.println(line);
                pw.println(line);
            }

            br.close();
            pw.close();
        }catch (Exception e) {
            e.printStackTrace();
        }
    }
}
