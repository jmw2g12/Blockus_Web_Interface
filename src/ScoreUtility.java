import java.io.File;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
public class ScoreUtility{
	public static void main(String[] args){
		File workingDir = new File(System.getProperty("user.dir"));
		File scoresDir = new File(workingDir,"scores");
		File filesDir;
		if (!scoresDir.exists()){
			System.out.println("scores dir does not exist!");
			return;
		}
		/*
		if (args.length > 0){
			filesDir = new File(scoresDir,args[0]);
		}else{
			filesDir = scoresDir;
		}
		if (!filesDir.exists()){
			System.out.println("files dir does not exist!");
			return;
		}
		*/
		ArrayList<Integer> scores = new ArrayList<Integer>(2);
		for (int i = 0; i < 2; i++) scores.add(0);
		ArrayList<String> names = new ArrayList<String>(2);
		for (int i = 0; i < 2; i++) names.add(args[i]);
		ArrayList<Integer> wins = new ArrayList<Integer>(2);
		for (int i = 0; i < 2; i++) wins.add(0);
		ArrayList<Boolean> firstNameMovedFirst = new ArrayList<Boolean>();
		boolean gotNames = false;
		int winningScore = 0;
		int winningID = 0;
		BufferedReader br;
		String line = "";
		for (File f : scoresDir.listFiles()){
			//if (f.getName().startsWith("score")){
				try{
					br = new BufferedReader(new FileReader(f));
					boolean omit_file = true;
					String line1 = br.readLine();
					String line2 = br.readLine();
					System.out.print(line1 + " , " + line2);
					String name1 = line1.split(",")[0];
					String name2 = line2.split(",")[0];
					if (name1.equals(names.get(0)) && name2.equals(names.get(1))){
						omit_file = false;
						firstNameMovedFirst.add(true);
						System.out.println("");
					}else if(name1.equals(names.get(1)) && name2.equals(names.get(0))){
						omit_file = false;
						firstNameMovedFirst.add(false);
						System.out.println("");
					}else{
						System.out.println(" <- skipped");
					}
					br.close();
					if (omit_file) continue;
					br = new BufferedReader(new FileReader(f));
					for (int i = 0; i < 2; i++){
						line = br.readLine();
						scores.set(i,scores.get(i)+Integer.parseInt(line.split(",")[1]));
						if (Integer.parseInt(line.split(",")[1]) > winningScore){
							winningID = i;
							winningScore = Integer.parseInt(line.split(",")[1]);
						}
						if (!gotNames){
							names.set(i,line.split(",")[0]);
						}
					}
					wins.set(winningID,wins.get(winningID)+1);
					winningScore = 0;
					gotNames = true;
					br.close();
					
				}catch (IOException ioe){
					System.out.println("caught ioe");
				}
			//}
		}
		int fnmf = 0;
		int snmf = 0;
		int total = 0;
		for (Boolean b : firstNameMovedFirst){
			fnmf = Collections.frequency(firstNameMovedFirst, true);
			snmf = Collections.frequency(firstNameMovedFirst, false);
			total = firstNameMovedFirst.size();
		}
		for (Integer s : scores){
			System.out.println(names.get(scores.indexOf(s)) + " (#" + scores.indexOf(s) + ") :   score = " + s + "   wins = " + wins.get(scores.indexOf(s)) + "  went first " + (scores.indexOf(s) == 0 ? fnmf : snmf) + " out of " + total + " times");
		}
	}
}